use anchor_lang::prelude::*;
use crate::{LoyaltyProgram, Merchant, SolcityError};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterMerchant<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        init,
        payer = merchant_authority,
        space = 8 + Merchant::INIT_SPACE,
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump
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

pub fn handler(
    ctx: Context<RegisterMerchant>,
    name: String,
    reward_rate: u64,
) -> Result<()> {
    require!(!name.is_empty(), SolcityError::NameEmpty);
    require!(name.len() <= 32, SolcityError::NameTooLong);
    require!(reward_rate > 0, SolcityError::InvalidRewardAmount);

    let merchant = &mut ctx.accounts.merchant;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    merchant.authority = ctx.accounts.merchant_authority.key();
    merchant.loyalty_program = loyalty_program.key();
    merchant.name = name.clone();
    merchant.reward_rate = reward_rate;
    merchant.total_issued = 0;
    merchant.total_redeemed = 0;
    merchant.is_active = true;
    merchant.bump = ctx.bumps.merchant;
    merchant.created_at = clock.unix_timestamp;

    loyalty_program.total_merchants = loyalty_program
        .total_merchants
        .checked_add(1)
        .ok_or(SolcityError::Overflow)?;

    msg!("Merchant '{}' registered with reward rate: {} tokens/$", name, reward_rate);
    
    Ok(())
}
