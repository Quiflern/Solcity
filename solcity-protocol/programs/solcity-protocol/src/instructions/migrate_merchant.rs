use anchor_lang::prelude::*;
use crate::{Merchant, SolcityError};

#[derive(Accounts)]
pub struct MigrateMerchant<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            merchant.loyalty_program.as_ref()
        ],
        bump = merchant.bump,
        realloc = 8 + Merchant::INIT_SPACE,
        realloc::payer = merchant_authority,
        realloc::zero = false,
    )]
    pub merchant: Account<'info, Merchant>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<MigrateMerchant>,
    avatar_url: String,
) -> Result<()> {
    require!(avatar_url.len() <= 128, SolcityError::NameTooLong);

    let merchant = &mut ctx.accounts.merchant;
    merchant.avatar_url = avatar_url;

    msg!("Merchant account migrated with avatar URL");

    Ok(())
}
