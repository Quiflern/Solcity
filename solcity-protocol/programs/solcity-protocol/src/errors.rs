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

    #[msg("Name cannot be empty")]
    NameEmpty,

    #[msg("Invalid interest rate")]
    InvalidInterestRate,

    #[msg("Unauthorized access to account")]
    UnauthorizedAccess,

    #[msg("Invalid mint for token account")]
    InvalidMint,

    #[msg("Invalid platform treasury account")]
    InvalidTreasury,

    #[msg("Redemption offer is not available (expired, sold out, or inactive)")]
    OfferNotAvailable,

    #[msg("Merchant has active reward rules. Delete all rules before closing account.")]
    MerchantHasActiveRules,

    #[msg("Voucher has already been used")]
    VoucherAlreadyUsed,

    #[msg("Voucher has expired")]
    VoucherExpired,

    #[msg("Invalid account provided")]
    InvalidAccount,
}
