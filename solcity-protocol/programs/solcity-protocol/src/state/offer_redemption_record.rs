use anchor_lang::prelude::*;

/// Tracks individual redemptions of offers
/// Allows merchants to see who redeemed what and when
#[account]
#[derive(InitSpace)]
pub struct OfferRedemptionRecord {
    /// Redemption offer that was redeemed
    pub offer: Pubkey,

    /// Merchant who owns the offer
    pub merchant: Pubkey,

    /// Customer who redeemed
    pub customer: Pubkey,

    /// Voucher created
    pub voucher: Pubkey,

    /// Amount of tokens spent
    pub amount: u64,

    /// Timestamp of redemption
    pub timestamp: i64,

    /// Whether voucher has been used
    pub is_used: bool,

    /// When voucher was used (if applicable)
    pub used_at: Option<i64>,

    /// PDA bump
    pub bump: u8,
}

impl OfferRedemptionRecord {
    pub const SEED_PREFIX: &'static [u8] = b"offer_redemption";

    // Space: 8 + 32 + 32 + 32 + 32 + 8 + 8 + 1 + 9 + 1 = 163
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 1 + 9 + 1;
}
