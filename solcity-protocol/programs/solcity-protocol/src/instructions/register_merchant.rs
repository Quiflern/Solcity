use crate::{LoyaltyProgram, Merchant, SolcityError, MERCHANT_REGISTRATION_FEE};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

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

    /// CHECK: Platform treasury account to receive fees
    #[account(
        mut,
        constraint = platform_treasury.key() == loyalty_program.treasury @ SolcityError::InvalidTreasury
    )]
    pub platform_treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterMerchant>,
    name: String,
    avatar_url: String,
    category: String,
    description: Option<String>,
    reward_rate: u64,
) -> Result<()> {
    require!(!name.is_empty(), SolcityError::NameEmpty);
    require!(name.len() <= 32, SolcityError::NameTooLong);
    require!(avatar_url.len() <= 256, SolcityError::NameTooLong);
    require!(!category.is_empty(), SolcityError::NameEmpty);
    require!(category.len() <= 32, SolcityError::NameTooLong);
    require!(reward_rate > 0, SolcityError::InvalidRewardAmount);

    if let Some(ref desc) = description {
        require!(desc.len() <= 256, SolcityError::NameTooLong);
    }

    // Collect registration fee
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.merchant_authority.to_account_info(),
                to: ctx.accounts.platform_treasury.to_account_info(),
            },
        ),
        MERCHANT_REGISTRATION_FEE,
    )?;

    let merchant = &mut ctx.accounts.merchant;
    let loyalty_program = &mut ctx.accounts.loyalty_program;
    let clock = Clock::get()?;

    merchant.authority = ctx.accounts.merchant_authority.key();
    merchant.loyalty_program = loyalty_program.key();
    merchant.name = name.clone();
    merchant.description = description.unwrap_or_default();
    merchant.avatar_url = avatar_url;
    merchant.category = category;
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

    loyalty_program.total_fees_collected = loyalty_program
        .total_fees_collected
        .checked_add(MERCHANT_REGISTRATION_FEE)
        .ok_or(SolcityError::Overflow)?;

    msg!(
        "Merchant '{}' registered with reward rate: {} tokens/$ (Fee: {} lamports)",
        name,
        reward_rate,
        MERCHANT_REGISTRATION_FEE
    );

    Ok(())
}
