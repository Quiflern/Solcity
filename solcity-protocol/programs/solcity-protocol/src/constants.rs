/// Tier thresholds (in tokens earned)
pub const BRONZE_THRESHOLD: u64 = 0;
pub const SILVER_THRESHOLD: u64 = 1_000;
pub const GOLD_THRESHOLD: u64 = 10_000;
pub const PLATINUM_THRESHOLD: u64 = 50_000;

/// Tier multipliers (in basis points, 100 = 1.0x)
pub const BRONZE_MULTIPLIER: u64 = 100;   // 1.0x
pub const SILVER_MULTIPLIER: u64 = 125;   // 1.25x
pub const GOLD_MULTIPLIER: u64 = 150;     // 1.5x
pub const PLATINUM_MULTIPLIER: u64 = 200; // 2.0x

/// Token configuration
pub const TOKEN_DECIMALS: u8 = 6;
pub const DEFAULT_INTEREST_RATE: i16 = 500; // 5% APY (in basis points)

/// Basis points divisor
pub const BASIS_POINTS: u64 = 10_000;
pub const PERCENTAGE_DIVISOR: u64 = 100;
