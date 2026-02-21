use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Customer {
    /// Customer wallet address
    pub wallet: Pubkey,

    /// Associated loyalty program
    pub loyalty_program: Pubkey,

    /// Lifetime tokens earned
    pub total_earned: u64,

    /// Lifetime tokens redeemed
    pub total_redeemed: u64,

    /// Current tier
    pub tier: CustomerTier,

    /// Number of transactions
    pub transaction_count: u64,

    /// Consecutive days active
    pub streak_days: u16,

    /// Last activity timestamp
    pub last_activity: i64,

    /// PDA bump
    pub bump: u8,

    /// Registration timestamp
    pub joined_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum CustomerTier {
    Bronze,   // 0 - 999 lifetime tokens
    Silver,   // 1,000 - 9,999
    Gold,     // 10,000 - 49,999
    Platinum, // 50,000+
}

impl Customer {
    pub const SEED_PREFIX: &'static [u8] = b"customer";

    /// Calculate tier based on total earned
    pub fn calculate_tier(total_earned: u64) -> CustomerTier {
        match total_earned {
            0..=999 => CustomerTier::Bronze,
            1_000..=9_999 => CustomerTier::Silver,
            10_000..=49_999 => CustomerTier::Gold,
            _ => CustomerTier::Platinum,
        }
    }

    /// Get tier multiplier (percentage-based, 100 = 1x, divide by PERCENTAGE_DIVISOR)
    pub fn get_tier_multiplier(&self) -> u64 {
        match self.tier {
            CustomerTier::Bronze => 100,   // 1.0x
            CustomerTier::Silver => 125,   // 1.25x
            CustomerTier::Gold => 150,     // 1.5x
            CustomerTier::Platinum => 200, // 2.0x
        }
    }
}
