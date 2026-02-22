use anchor_lang::prelude::*;
use crate::{Merchant, RedemptionOffer, RedemptionType, SolcityError};

#[derive(Accounts)]
pub struct UpdateRedemptionOffer<'info> {
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    #[account(
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            merchant.loyalty_program.as_ref()
        ],
        bump = merchant.bump,
    )]
    pub merchant: Account<'info, Merchant>,

    #[account(
        mut,
        seeds = [
            RedemptionOffer::SEED_PREFIX,
            merchant.key().as_ref(),
            redemption_offer.name.as_bytes()
        ],
        bump = redemption_offer.bump,
        constraint = redemption_offer.merchant == merchant.key() @ SolcityError::UnauthorizedAccess,
    )]
    pub redemption_offer: Account<'info, RedemptionOffer>,
}

pub fn handler(
    ctx: Context<UpdateRedemptionOffer>,
    description: Option<String>,
    icon: Option<String>,
    cost: Option<u64>,
    offer_type: Option<RedemptionType>,
    quantity_limit: Option<Option<u64>>,
    expiration: Option<Option<i64>>,
) -> Result<()> {
    let offer = &mut ctx.accounts.redemption_offer;

    if let Some(desc) = description {
        require!(desc.len() <= 256, SolcityError::NameTooLong);
        offer.description = desc;
    }

    if let Some(ic) = icon {
        require!(ic.len() <= 32, SolcityError::NameTooLong);
        offer.icon = ic;
    }

    if let Some(c) = cost {
        require!(c > 0, SolcityError::InvalidRewardAmount);
        offer.cost = c;
    }

    if let Some(ot) = offer_type {
        offer.offer_type = ot;
    }

    if let Some(ql) = quantity_limit {
        offer.quantity_limit = ql;
    }

    if let Some(exp) = expiration {
        offer.expiration = exp;
    }

    msg!("Redemption offer '{}' updated", offer.name);

    Ok(())
}
