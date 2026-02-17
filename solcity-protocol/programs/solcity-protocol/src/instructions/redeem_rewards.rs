use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};
use crate::{LoyaltyProgram, Merchant, Customer, SolcityError};

#[derive(Accounts)]
pub struct RedeemRewards<'info> {
    #[account(mut)]
    pub customer_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Customer::SEED_PREFIX,
            customer_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = customer.bump,
    )]
    pub customer: Account<'info, Customer>,

    #[account(
        mut,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant.authority.as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,

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
        constraint = customer_token_account.owner == customer_authority.key() @ SolcityError::UnauthorizedAccess,
        constraint = customer_token_account.mint == mint.key() @ SolcityError::InvalidMint,
    )]
    pub customer_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum RedemptionType {
    Discount { percentage: u8 },
    FreeProduct { product_id: String },
    Cashback { amount_lamports: u64 },
    ExclusiveAccess { access_type: String },
}

pub fn handler(
    ctx: Context<RedeemRewards>,
    amount: u64,
    redemption_type: RedemptionType,
) -> Result<()> {
    require!(amount > 0, SolcityError::InvalidRewardAmount);
    require!(
        ctx.accounts.customer_token_account.amount >= amount,
        SolcityError::InsufficientBalance
    );

    // Burn tokens from customer account
    token_2022::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_2022::Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.customer_token_account.to_account_info(),
                authority: ctx.accounts.customer_authority.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update state
    let customer = &mut ctx.accounts.customer;
    let merchant = &mut ctx.accounts.merchant;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    customer.total_redeemed = customer
        .total_redeemed
        .checked_add(amount)
        .ok_or(SolcityError::Overflow)?;

    merchant.total_redeemed = merchant
        .total_redeemed
        .checked_add(amount)
        .ok_or(SolcityError::Overflow)?;

    loyalty_program.total_tokens_redeemed = loyalty_program
        .total_tokens_redeemed
        .checked_add(amount)
        .ok_or(SolcityError::Overflow)?;

    customer.last_activity = clock.unix_timestamp;

    // Emit event for off-chain processing
    emit!(RedemptionEvent {
        customer: customer.wallet,
        merchant: merchant.authority,
        amount,
        redemption_type,
        timestamp: clock.unix_timestamp,
    });

    msg!("Redeemed {} tokens", amount);

    Ok(())
}

#[event]
pub struct RedemptionEvent {
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub redemption_type: RedemptionType,
    pub timestamp: i64,
}
