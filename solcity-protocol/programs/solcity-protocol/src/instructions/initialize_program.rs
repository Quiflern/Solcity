use crate::{LoyaltyProgram, SolcityError, DEFAULT_INTEREST_RATE};
use anchor_lang::prelude::*;
use anchor_spl::token_2022::Token2022;
use anchor_spl::token_interface::Mint;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeProgram<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + LoyaltyProgram::INIT_SPACE,
        seeds = [LoyaltyProgram::SEED_PREFIX, authority.key().as_ref()],
        bump
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    /// Token-2022 mint (will be initialized with extensions)
    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = loyalty_program,
        mint::freeze_authority = loyalty_program,
        mint::token_program = token_program,
        seeds = [b"mint", loyalty_program.key().as_ref()],
        bump
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeProgram>,
    name: String,
    interest_rate: Option<i16>,
) -> Result<()> {
    require!(!name.is_empty(), SolcityError::NameEmpty);
    require!(name.len() <= 32, SolcityError::NameTooLong);

    let rate = interest_rate.unwrap_or(DEFAULT_INTEREST_RATE);
    require!(
        rate >= 0 && rate <= 10000,
        SolcityError::InvalidInterestRate
    );

    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    loyalty_program.authority = ctx.accounts.authority.key();
    loyalty_program.treasury = ctx.accounts.authority.key(); // Treasury is authority for now
    loyalty_program.mint = ctx.accounts.mint.key();
    loyalty_program.name = name.clone();
    loyalty_program.total_merchants = 0;
    loyalty_program.total_customers = 0;
    loyalty_program.total_tokens_issued = 0;
    loyalty_program.total_tokens_redeemed = 0;
    loyalty_program.total_fees_collected = 0;
    loyalty_program.interest_rate = rate;
    loyalty_program.bump = ctx.bumps.loyalty_program;
    loyalty_program.created_at = clock.unix_timestamp;

    msg!(
        "Loyalty Program '{}' initialized with {}% APY",
        name,
        rate as f64 / 100.0
    );

    Ok(())
}
