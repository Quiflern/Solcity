use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LoyaltyProgram {
    /// Program authority (admin)
    pub authority: Pubkey,
    
    /// SPL Token-2022 mint address
    pub mint: Pubkey,
    
    /// Program name (32 bytes)
    #[max_len(32)]
    pub name: String,
    
    /// Total registered merchants
    pub total_merchants: u64,
    
    /// Total registered customers
    pub total_customers: u64,
    
    /// Total tokens ever minted
    pub total_tokens_issued: u64,
    
    /// Total tokens ever burned
    pub total_tokens_redeemed: u64,
    
    /// Interest rate in basis points (500 = 5%)
    pub interest_rate: i16,
    
    /// PDA bump
    pub bump: u8,
    
    /// Creation timestamp
    pub created_at: i64,
}

impl LoyaltyProgram {
    pub const SEED_PREFIX: &'static [u8] = b"loyalty_program";
}
