use crate::{LoyaltyProgram, Merchant};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseMerchant<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        mut,
        close = merchant_authority,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            merchant.loyalty_program.as_ref()
        ],
        bump = merchant.bump,
        constraint = merchant.authority == merchant_authority.key()
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        mut,
        seeds = [LoyaltyProgram::SEED_PREFIX, loyalty_program.authority.as_ref()],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseMerchant>) -> Result<()> {
    let merchant = &ctx.accounts.merchant;
    let loyalty_program = &mut ctx.accounts.loyalty_program;

    // Decrement total merchants count
    loyalty_program.total_merchants = loyalty_program
        .total_merchants
        .saturating_sub(1);

    msg!(
        "Merchant '{}' closed. Rent refunded to authority. Note: Reward rules must be deleted separately.",
        merchant.name
    );

    Ok(())
}
