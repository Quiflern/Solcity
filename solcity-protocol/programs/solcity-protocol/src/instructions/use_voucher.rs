use crate::{
    Merchant, OfferRedemptionRecord, RedemptionVoucher, VoucherUsedEvent, SolcityError
};
use anchor_lang::prelude::*;

/// Voucher status that merchant can set
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoucherStatus {
    Active,
    Used,
    Revoked,
}

#[derive(Accounts)]
pub struct UpdateVoucherStatus<'info> {
    /// Merchant authority who is updating the voucher status
    #[account(mut)]
    pub merchant_authority: Signer<'info>,

    /// Merchant account - must match the voucher's merchant
    #[account(
        seeds = [
            Merchant::SEED_PREFIX,
            merchant_authority.key().as_ref(),
            merchant.loyalty_program.as_ref()
        ],
        bump = merchant.bump,
        constraint = merchant.authority == merchant_authority.key() @ SolcityError::UnauthorizedAccess,
    )]
    pub merchant: Box<Account<'info, Merchant>>,

    /// Voucher to update
    #[account(
        mut,
        constraint = voucher.merchant == merchant.key() @ SolcityError::UnauthorizedAccess,
    )]
    pub voucher: Box<Account<'info, RedemptionVoucher>>,

    /// Offer redemption record to update
    #[account(
        mut,
        constraint = offer_redemption_record.voucher == voucher.key() @ SolcityError::InvalidAccount,
    )]
    pub offer_redemption_record: Box<Account<'info, OfferRedemptionRecord>>,
}

pub fn handler(ctx: Context<UpdateVoucherStatus>, status: VoucherStatus) -> Result<()> {
    let clock = Clock::get()?;
    let voucher = &mut ctx.accounts.voucher;
    let offer_redemption_record = &mut ctx.accounts.offer_redemption_record;

    match status {
        VoucherStatus::Used => {
            // Check if voucher is already used
            require!(!voucher.is_used, SolcityError::VoucherAlreadyUsed);
            
            // Check if voucher is expired
            require!(
                clock.unix_timestamp < voucher.expires_at,
                SolcityError::VoucherExpired
            );

            // Mark voucher as used
            voucher.mark_as_used(clock.unix_timestamp);
            offer_redemption_record.is_used = true;
            offer_redemption_record.used_at = Some(clock.unix_timestamp);

            // Emit event
            emit!(VoucherUsedEvent {
                voucher: voucher.key(),
                customer: voucher.customer,
                merchant: voucher.merchant,
                offer_name: voucher.offer_name.clone(),
                redemption_code: voucher.redemption_code.clone(),
                timestamp: clock.unix_timestamp,
            });

            msg!("Voucher {} marked as used", voucher.redemption_code);
        }
        VoucherStatus::Revoked => {
            // Merchant can revoke any voucher (used or not)
            voucher.is_used = true; // Mark as used to prevent future use
            voucher.used_at = Some(clock.unix_timestamp);
            offer_redemption_record.is_used = true;
            offer_redemption_record.used_at = Some(clock.unix_timestamp);

            msg!("Voucher {} revoked by merchant", voucher.redemption_code);
        }
        VoucherStatus::Active => {
            // Merchant can reactivate a voucher (undo revoke, but not undo used)
            // This is useful if merchant accidentally revoked wrong voucher
            require!(
                voucher.is_used && voucher.used_at.is_some(),
                SolcityError::VoucherAlreadyUsed
            );

            voucher.is_used = false;
            voucher.used_at = None;
            offer_redemption_record.is_used = false;
            offer_redemption_record.used_at = None;

            msg!("Voucher {} reactivated", voucher.redemption_code);
        }
    }

    Ok(())
}
