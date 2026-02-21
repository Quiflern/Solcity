use crate::{Customer, CustomerTier, LoyaltyProgram, SolcityError};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::Token2022;
use anchor_spl::token_interface::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct RegisterCustomer<'info> {
    #[account(mut)]
    pub customer_authority: Signer<'info>,

    #[account(
        init,
        payer = customer_authority,
        space = 8 + Customer::INIT_SPACE,
        seeds = [
            Customer::SEED_PREFIX,
            customer_authority.key().as_ref(),
            loyalty_program.key().as_ref()
        ],
        bump
    )]
    pub customer: Account<'info, Customer>,

    #[account(
        mut,
        seeds = [LoyaltyProgram::SEED_PREFIX, loyalty_program.authority.as_ref()],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    #[account(
        seeds = [b"mint", loyalty_program.key().as_ref()],
        bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = customer_authority,
        associated_token::mint = mint,
        associated_token::authority = customer_authority,
        associated_token::token_program = token_program,
    )]
    pub customer_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterCustomer>) -> Result<()> {
    let customer = &mut ctx.accounts.customer;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    customer.wallet = ctx.accounts.customer_authority.key();
    customer.loyalty_program = loyalty_program.key();
    customer.total_earned = 0;
    customer.total_redeemed = 0;
    customer.tier = CustomerTier::Bronze;
    customer.transaction_count = 0;
    customer.streak_days = 0;
    customer.last_activity = clock.unix_timestamp;
    customer.bump = ctx.bumps.customer;
    customer.joined_at = clock.unix_timestamp;

    loyalty_program.total_customers = loyalty_program
        .total_customers
        .checked_add(1)
        .ok_or(SolcityError::Overflow)?;

    msg!("Customer registered with Bronze tier");

    Ok(())
}
