use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};
use crate::{LoyaltyProgram, Merchant, Customer, SolcityError, PERCENTAGE_DIVISOR, ISSUANCE_FEE_PER_TOKEN};

#[derive(Accounts)]
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
) -> Result<()> {
    require!(purchase_amount > 0, SolcityError::InvalidRewardAmount);

    let merchant = &mut ctx.accounts.merchant;
    let customer = &mut ctx.accounts.customer;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    // Calculate base reward: purchase_amount * reward_rate / 100
    let base_reward = purchase_amount
        .checked_mul(merchant.reward_rate)
        .ok_or(SolcityError::Overflow)?
        .checked_div(PERCENTAGE_DIVISOR)
        .ok_or(SolcityError::Overflow)?;

    // Apply tier multiplier
    let tier_multiplier = customer.get_tier_multiplier();
    let final_reward = base_reward
        .checked_mul(tier_multiplier)
        .ok_or(SolcityError::Overflow)?
        .checked_div(PERCENTAGE_DIVISOR)
        .ok_or(SolcityError::Overflow)?;

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
    let new_tier = Customer::calculate_tier(customer.total_earned);
    if new_tier != customer.tier {
        let old_tier = customer.tier.clone();
        customer.tier = new_tier.clone();
        msg!("Customer upgraded from {:?} to {:?}", old_tier, new_tier);
    }

    msg!(
        "Issued {} tokens (purchase: ${}, tier: {:?}, multiplier: {}x, fee: {} lamports)",
        final_reward,
        purchase_amount as f64 / 100.0,
        customer.tier,
        tier_multiplier as f64 / 100.0,
        platform_fee
    );

    Ok(())
}
