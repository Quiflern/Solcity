use anchor_lang::prelude::*;

/// Tracks relationship between merchant and customer
/// One record per merchant-customer pair
#[account]
#[derive(InitSpace)]
pub struct MerchantCustomerRecord {
    /// Merchant pubkey
    pub merchant: Pubkey,

    /// Customer wallet
    pub customer: Pubkey,

    /// Total tokens issued to this customer by this merchant
    pub total_issued: u64,

    /// Total tokens redeemed by this customer at this merchant
    pub total_redeemed: u64,

    /// Number of transactions (earn + redeem)
    pub transaction_count: u64,

    /// First transaction timestamp
    pub first_transaction: i64,

    /// Last transaction timestamp
    pub last_transaction: i64,

    /// PDA bump
    pub bump: u8,
}

impl MerchantCustomerRecord {
    pub const SEED_PREFIX: &'static [u8] = b"merchant_customer";

    // Space: 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 = 113
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}
