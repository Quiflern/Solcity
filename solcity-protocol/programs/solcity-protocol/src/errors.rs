use anchor_lang::prelude::*;

#[error_code]
pub enum SolcityError {
    #[msg("Insufficient token balance for redemption")]
    InsufficientBalance,
    
    #[msg("Merchant account is not active")]
    MerchantNotActive,
    
    #[msg("Invalid reward amount")]
    InvalidRewardAmount,
    
    #[msg("Arithmetic overflow in calculation")]
    Overflow,
    
    #[msg("Invalid customer tier")]
    InvalidTier,
    
    #[msg("Reward rule is not active")]
    RuleNotActive,
    
    #[msg("Invalid time range for reward rule")]
    InvalidTimeRange,
    
    #[msg("Name exceeds maximum length")]
    NameTooLong,
    
    #[msg("Invalid interest rate")]
    InvalidInterestRate,
}
