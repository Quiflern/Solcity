use anchor_lang::prelude::*;

/// Stores individual transaction records for customers
/// Each transaction (earn or redeem) creates a new record
#[account]
#[derive(InitSpace)]
pub struct TransactionRecord {
    /// Customer wallet
    pub customer: Pubkey,

    /// Merchant involved
    pub merchant: Pubkey,

    /// Transaction type: 0 = Earned, 1 = Redeemed
    pub transaction_type: u8,

    /// Amount of tokens
    pub amount: u64,

    /// Customer tier at time of transaction
    pub tier: u8, // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum

    /// Timestamp
    pub timestamp: i64,

    /// Transaction index for this customer (for ordering)
    pub index: u64,

    /// PDA bump
    pub bump: u8,
}

impl TransactionRecord {
    pub const SEED_PREFIX: &'static [u8] = b"transaction";

    // Space calculation:
    // 8 (discriminator) + 32 (customer) + 32 (merchant) + 1 (type) + 8 (amount) 
    // + 1 (tier) + 8 (timestamp) + 8 (index) + 1 (bump) = 99
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 1 + 8 + 8 + 1;
}
