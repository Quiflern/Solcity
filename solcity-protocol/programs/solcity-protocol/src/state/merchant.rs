use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    /// Merchant wallet address
    pub authority: Pubkey,

    /// Associated loyalty program
    pub loyalty_program: Pubkey,

    /// Business name (32 bytes)
    #[max_len(32)]
    pub name: String,

    /// Business description (256 bytes)
    #[max_len(256)]
    pub description: String,

    /// Avatar URL (128 bytes)
    #[max_len(128)]
    pub avatar_url: String,

    /// Tokens per dollar spent (e.g., 10 = 10 tokens per $1)
    pub reward_rate: u64,

    /// Total tokens issued by this merchant
    pub total_issued: u64,

    /// Total tokens redeemed at this merchant
    pub total_redeemed: u64,

    /// Active status
    pub is_active: bool,

    /// PDA bump
    pub bump: u8,

    /// Registration timestamp
    pub created_at: i64,
}

impl Merchant {
    pub const SEED_PREFIX: &'static [u8] = b"merchant";
}
