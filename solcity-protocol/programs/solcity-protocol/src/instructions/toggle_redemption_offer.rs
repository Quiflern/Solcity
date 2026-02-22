use anchor_lang::prelude::*;
use crate::{Merchant, RedemptionOffer, SolcityError};

#[derive(Accounts)]
pub struct ToggleRedemptionOffer<'info> {
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

pub fn handler(ctx: Context<ToggleRedemptionOffer>) -> Result<()> {
    let offer = &mut ctx.accounts.redemption_offer;
    offer.is_active = !offer.is_active;

    msg!(
        "Redemption offer '{}' is now {}",
        offer.name,
        if offer.is_active { "active" } else { "inactive" }
    );

    Ok(())
}
