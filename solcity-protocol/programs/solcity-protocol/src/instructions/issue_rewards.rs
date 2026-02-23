use crate::{
    Customer, LoyaltyProgram, Merchant, RewardRule, RewardsIssuedEvent, TierUpgradeEvent,
    SolcityError, ISSUANCE_FEE_PER_TOKEN, PERCENTAGE_DIVISOR,
};
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
#[instruction(purchase_amount: u64, rule_id: Option<u64>)]
pub struct IssueRewards<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = merchant.bump,
        constraint = merchant.is_active @ SolcityError::MerchantNotActive,
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        mut,
        seeds = [
            Customer::SEED_PREFIX,
            customer.wallet.as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = customer.bump,
    )]
    pub customer: Account<'info, Customer>,

    #[account(
        mut,
        seeds = [LoyaltyProgram::SEED_PREFIX, loyalty_program.authority.as_ref()],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    #[account(
        mut,
        seeds = [b"mint", loyalty_program.key().as_ref()],
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        constraint = customer_token_account.owner == customer.wallet @ SolcityError::UnauthorizedAccess,
        constraint = customer_token_account.mint == mint.key() @ SolcityError::InvalidMint,
    )]
    pub customer_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Optional reward rule to apply
    /// CHECK: Optional account, validated in handler if provided
    pub reward_rule: AccountInfo<'info>,

    /// CHECK: Platform treasury account to receive fees
    #[account(
        mut,
        constraint = platform_treasury.key() == loyalty_program.treasury @ SolcityError::InvalidTreasury
    )]
    pub platform_treasury: AccountInfo<'info>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<IssueRewards>,
    purchase_amount: u64, // Amount in cents (e.g., 1000 = $10.00)
    _rule_id: Option<u64>,
) -> Result<()> {
    require!(purchase_amount > 0, SolcityError::InvalidRewardAmount);

    // Get keys before mutable borrows
    let customer_key = ctx.accounts.customer.key();
    let merchant_key = ctx.accounts.merchant.key();
    let merchant_authority_key = ctx.accounts.merchant_authority.key();

    let merchant = &mut ctx.accounts.merchant;
    let customer = &mut ctx.accounts.customer;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    // Calculate base reward: (purchase_amount / 100) * reward_rate
    // purchase_amount is in cents, reward_rate is tokens per dollar
    // So we divide purchase_amount by 100 to get dollars, then multiply by reward_rate
    let base_reward = purchase_amount
        .checked_mul(merchant.reward_rate)
        .ok_or(SolcityError::Overflow)?
        .checked_div(PERCENTAGE_DIVISOR)
        .ok_or(SolcityError::Overflow)?
        .checked_div(100) // Divide by 100 again because purchase_amount is in cents
        .ok_or(SolcityError::Overflow)?;

    // Apply tier multiplier
    let tier_multiplier = customer.get_tier_multiplier();
    let mut final_reward = base_reward
        .checked_mul(tier_multiplier)
        .ok_or(SolcityError::Overflow)?
        .checked_div(PERCENTAGE_DIVISOR)
        .ok_or(SolcityError::Overflow)?;

    // Apply reward rule if provided
    let mut rule_applied = false;
    let mut rule_multiplier = 100u64; // Default 1.0x
    let mut rule_name: Option<String> = None;
    
    msg!("Checking reward_rule account: {}", ctx.accounts.reward_rule.key);
    msg!("System program ID: {}", System::id());
    
    // Check if reward_rule account is provided (not the default system program)
    if *ctx.accounts.reward_rule.key != System::id() {
        msg!("Reward rule account provided, attempting to deserialize...");
        
        // Try to deserialize the reward rule account
        let rule_data = ctx.accounts.reward_rule.try_borrow_data()?;
        msg!("Rule data length: {}", rule_data.len());
        
        if rule_data.len() > 8 { // Check if account has data beyond discriminator
            // Manually deserialize using AnchorDeserialize
            let mut data_slice: &[u8] = &rule_data[8..]; // Skip 8-byte discriminator
            match RewardRule::deserialize(&mut data_slice) {
                Ok(rule) => {
                    msg!("Successfully deserialized rule: {}", rule.name);
                    msg!("Rule multiplier: {}", rule.multiplier);
                    msg!("Rule is_active: {}", rule.is_active);
                    msg!("Rule min_purchase: {}", rule.min_purchase);
                    msg!("Current time: {}", clock.unix_timestamp);
                    msg!("Rule start_time: {}", rule.start_time);
                    msg!("Rule end_time: {}", rule.end_time);
                    
                    // Check if rule is active and valid
                    if rule.is_currently_active(clock.unix_timestamp) {
                        msg!("Rule is currently active");
                        
                        // Check minimum purchase requirement
                        if purchase_amount >= rule.min_purchase {
                            msg!("Purchase amount {} meets minimum {}", purchase_amount, rule.min_purchase);
                            
                            final_reward = final_reward
                                .checked_mul(rule.multiplier)
                                .ok_or(SolcityError::Overflow)?
                                .checked_div(PERCENTAGE_DIVISOR)
                                .ok_or(SolcityError::Overflow)?;
                            
                            rule_applied = true;
                            rule_multiplier = rule.multiplier;
                            rule_name = Some(rule.name.clone());
                            msg!("Applied rule '{}' with {}x multiplier", rule.name, rule.multiplier as f64 / 100.0);
                        } else {
                            msg!("Rule not applied: purchase amount ${} below minimum ${}", 
                                purchase_amount as f64 / 100.0, 
                                rule.min_purchase as f64 / 100.0
                            );
                        }
                    } else {
                        msg!("Rule not applied: rule is not currently active");
                    }
                },
                Err(e) => {
                    msg!("Failed to deserialize rule: {:?}", e);
                }
            }
        } else {
            msg!("Rule data too short: {} bytes", rule_data.len());
        }
    } else {
        msg!("No reward rule provided (System program)");
    }

    require!(final_reward > 0, SolcityError::InvalidRewardAmount);

    // Calculate and collect platform fee
    let platform_fee = final_reward
        .checked_mul(ISSUANCE_FEE_PER_TOKEN)
        .ok_or(SolcityError::Overflow)?;

    if platform_fee > 0 {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.merchant_authority.to_account_info(),
                    to: ctx.accounts.platform_treasury.to_account_info(),
                },
            ),
            platform_fee,
        )?;

        loyalty_program.total_fees_collected = loyalty_program
            .total_fees_collected
            .checked_add(platform_fee)
            .ok_or(SolcityError::Overflow)?;
    }

    // Mint tokens to customer using PDA authority
    let program_seeds = &[
        LoyaltyProgram::SEED_PREFIX,
        loyalty_program.authority.as_ref(),
        &[loyalty_program.bump],
    ];
    let signer_seeds = &[&program_seeds[..]];

    token_2022::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_2022::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.customer_token_account.to_account_info(),
                authority: loyalty_program.to_account_info(),
            },
            signer_seeds,
        ),
        final_reward,
    )?;

    // Update state
    merchant.total_issued = merchant
        .total_issued
        .checked_add(final_reward)
        .ok_or(SolcityError::Overflow)?;

    customer.total_earned = customer
        .total_earned
        .checked_add(final_reward)
        .ok_or(SolcityError::Overflow)?;

    customer.transaction_count = customer
        .transaction_count
        .checked_add(1)
        .ok_or(SolcityError::Overflow)?;

    customer.last_activity = clock.unix_timestamp;

    loyalty_program.total_tokens_issued = loyalty_program
        .total_tokens_issued
        .checked_add(final_reward)
        .ok_or(SolcityError::Overflow)?;

    // Check for tier upgrade
    let old_tier = customer.tier.clone();
    let new_tier = Customer::calculate_tier(customer.total_earned);
    let customer_wallet = customer.wallet;
    
    if new_tier != customer.tier {
        customer.tier = new_tier.clone();
        msg!("Customer upgraded from {:?} to {:?}", old_tier, new_tier);
        
        // Emit tier upgrade event
        emit!(TierUpgradeEvent {
            customer: customer_key,
            customer_wallet,
            old_tier,
            new_tier: new_tier.clone(),
            total_earned: customer.total_earned,
            timestamp: clock.unix_timestamp,
        });
    }

    // Emit rewards issued event
    emit!(RewardsIssuedEvent {
        merchant: merchant_key,
        merchant_authority: merchant_authority_key,
        customer: customer_key,
        customer_wallet,
        purchase_amount,
        base_reward,
        tier_multiplier,
        rule_multiplier,
        rule_applied,
        rule_name,
        final_reward,
        customer_tier: customer.tier.clone(),
        platform_fee,
        timestamp: clock.unix_timestamp,
    });

    msg!(
        "Issued {} tokens (purchase: ${}, tier: {:?}, tier_mult: {}x, rule_mult: {}x, rule_applied: {}, fee: {} lamports)",
        final_reward,
        purchase_amount as f64 / 100.0,
        customer.tier,
        tier_multiplier as f64 / 100.0,
        rule_multiplier as f64 / 100.0,
        rule_applied,
        platform_fee
    );

    Ok(())
}
