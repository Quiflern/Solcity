use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RewardRule {
    /// Associated merchant
    pub merchant: Pubkey,
    
    /// Rule ID (used in PDA derivation)
    pub rule_id: u64,
    
    /// Rule name (32 bytes)
    #[max_len(32)]
    pub name: String,
    
    /// Rule type
    pub rule_type: RuleType,
    
    /// Bonus multiplier (100 = 1x, 200 = 2x)
    pub multiplier: u64,
    
    /// Minimum purchase to trigger (in cents)
    pub min_purchase: u64,
    
    /// Active status
    pub is_active: bool,
    
    /// Start time (0 = immediate)
    pub start_time: i64,
    
    /// End time (0 = no expiry)
    pub end_time: i64,
    
    /// PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum RuleType {
    BaseReward,          // Standard earning rate
    BonusMultiplier,     // 2x, 3x events
    FirstPurchaseBonus,  // One-time bonus
    ReferralBonus,       // Referral rewards
    TierBonus,           // Tier-based multiplier
    StreakBonus,         // Consecutive activity bonus
}

impl RewardRule {
    pub const SEED_PREFIX: &'static [u8] = b"reward_rule";
    
    /// Check if rule is currently active
    pub fn is_currently_active(&self, current_time: i64) -> bool {
        if !self.is_active {
            return false;
        }
        
        let after_start = self.start_time == 0 || current_time >= self.start_time;
        let before_end = self.end_time == 0 || current_time <= self.end_time;
        
        after_start && before_end
    }
}
