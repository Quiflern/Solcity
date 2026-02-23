use anchor_lang::prelude::*;
use crate::state::{CustomerTier, RedemptionType};

/// Event emitted when a merchant registers
#[event]
pub struct MerchantRegisteredEvent {
    pub merchant: Pubkey,
    pub authority: Pubkey,
    pub name: String,
    pub reward_rate: u64,
    pub timestamp: i64,
}

/// Event emitted when a customer registers
#[event]
pub struct CustomerRegisteredEvent {
    pub customer: Pubkey,
    pub wallet: Pubkey,
    pub merchant: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when rewards are issued
#[event]
pub struct RewardsIssuedEvent {
    pub merchant: Pubkey,
    pub merchant_authority: Pubkey,
    pub customer: Pubkey,
    pub customer_wallet: Pubkey,
    pub purchase_amount: u64, // in cents
    pub base_reward: u64,
    pub tier_multiplier: u64,
    pub rule_multiplier: u64,
    pub rule_applied: bool,
    pub rule_name: Option<String>,
    pub final_reward: u64,
    pub customer_tier: CustomerTier,
    pub platform_fee: u64,
    pub timestamp: i64,
}

/// Event emitted when rewards are redeemed
#[event]
pub struct RewardsRedeemedEvent {
    pub customer: Pubkey,
    pub customer_wallet: Pubkey,
    pub merchant: Pubkey,
    pub offer_name: String,
    pub amount: u64,
    pub redemption_type: RedemptionType,
    pub redemption_code: String,
    pub voucher: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when a reward rule is created or updated
#[event]
pub struct RewardRuleEvent {
    pub merchant: Pubkey,
    pub rule_id: u64,
    pub name: String,
    pub multiplier: u64,
    pub min_purchase: u64,
    pub is_active: bool,
    pub start_time: i64,
    pub end_time: i64,
    pub action: String, // "created", "updated", "toggled", "deleted"
    pub timestamp: i64,
}

/// Event emitted when a redemption offer is created or updated
#[event]
pub struct RedemptionOfferEvent {
    pub merchant: Pubkey,
    pub offer: Pubkey,
    pub name: String,
    pub cost: u64,
    pub offer_type: RedemptionType,
    pub is_active: bool,
    pub quantity_available: Option<u64>,
    pub quantity_claimed: u64,
    pub action: String, // "created", "updated", "toggled", "deleted"
    pub timestamp: i64,
}

/// Event emitted when a merchant profile is updated
#[event]
pub struct MerchantUpdatedEvent {
    pub merchant: Pubkey,
    pub name: Option<String>,
    pub reward_rate: Option<u64>,
    pub timestamp: i64,
}

/// Event emitted when a customer tier is upgraded
#[event]
pub struct TierUpgradeEvent {
    pub customer: Pubkey,
    pub customer_wallet: Pubkey,
    pub old_tier: CustomerTier,
    pub new_tier: CustomerTier,
    pub total_earned: u64,
    pub timestamp: i64,
}

/// Event emitted when a voucher is used
#[event]
pub struct VoucherUsedEvent {
    pub voucher: Pubkey,
    pub customer: Pubkey,
    pub merchant: Pubkey,
    pub offer_name: String,
    pub redemption_code: String,
    pub timestamp: i64,
}
