use anchor_lang::prelude::*;
use crate::{LoyaltyProgram, Merchant, RedemptionOffer, RedemptionType, SolcityError};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateRedemptionOffer<'info> {
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
        seeds = [LoyaltyProgram::SEED_PREFIX, loyalty_program.authority.as_ref()],
        bump = loyalty_program.bump,
    )]
    pub loyalty_program: Account<'info, LoyaltyProgram>,

    #[account(
        init,
        payer = merchant_authority,
        space = 8 + RedemptionOffer::INIT_SPACE,
        seeds = [
            RedemptionOffer::SEED_PREFIX,
            merchant.key().as_ref(),
            name.as_bytes()
        ],
        bump
    )]
    pub redemption_offer: Account<'info, RedemptionOffer>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateRedemptionOffer>,
    name: String,
    description: String,
    cost: u64,
    offer_type: RedemptionType,
    quantity_limit: Option<u64>,
    expiration: Option<i64>,
) -> Result<()> {
    require!(!name.is_empty(), SolcityError::NameEmpty);
    require!(name.len() <= 64, SolcityError::NameTooLong);
    require!(description.len() <= 256, SolcityError::NameTooLong);
    require!(cost > 0, SolcityError::InvalidRewardAmount);

    let offer = &mut ctx.accounts.redemption_offer;
    let clock = Clock::get()?;

    offer.merchant = ctx.accounts.merchant.key();
    offer.loyalty_program = ctx.accounts.loyalty_program.key();
    offer.name = name.clone();
    offer.description = description;
    offer.cost = cost;
    offer.offer_type = offer_type;
    offer.quantity_limit = quantity_limit;
    offer.quantity_claimed = 0;
    offer.expiration = expiration;
    offer.is_active = true;
    offer.created_at = clock.unix_timestamp;
    offer.bump = ctx.bumps.redemption_offer;

    msg!("Redemption offer '{}' created with cost: {} tokens", name, cost);

    Ok(())
}
