/**
 * Customer tier system utilities.
 *
 * This module defines the tier thresholds and provides utilities for
 * calculating customer tiers based on total earned tokens. These values
 * must match the Rust program's tier calculation logic.
 *
 * Tiers provide multipliers that increase the base reward rate:
 * - Bronze: 1.0x (0-999 tokens)
 * - Silver: 1.25x (1,000-9,999 tokens)
 * - Gold: 1.5x (10,000-49,999 tokens)
 * - Platinum: 2.0x (50,000+ tokens)
 */

export type TierName = "bronze" | "silver" | "gold" | "platinum";

/**
 * Information about a customer tier.
 */
export interface TierInfo {
  /** Internal tier name */
  name: TierName;
  /** Display name for UI */
  displayName: string;
  /** Minimum tokens required for this tier */
  min: number;
  /** Maximum tokens for this tier (inclusive) */
  max: number;
  /** Name of the next tier, or null if this is the highest */
  next: string | null;
  /** Reward multiplier for this tier (e.g., 1.25 for 1.25x) */
  multiplier: number;
}

/**
 * Tier threshold definitions.
 *
 * These thresholds must match the Rust program's tier calculation.
 */
export const TIER_THRESHOLDS: Record<TierName, TierInfo> = {
  bronze: {
    name: "bronze",
    displayName: "Bronze",
    min: 0,
    max: 999,
    next: "Silver",
    multiplier: 1.0,
  },
  silver: {
    name: "silver",
    displayName: "Silver",
    min: 1000,
    max: 9999,
    next: "Gold",
    multiplier: 1.25,
  },
  gold: {
    name: "gold",
    displayName: "Gold",
    min: 10000,
    max: 49999,
    next: "Platinum",
    multiplier: 1.5,
  },
  platinum: {
    name: "platinum",
    displayName: "Platinum",
    min: 50000,
    max: Infinity,
    next: null,
    multiplier: 2.0,
  },
};

/**
 * Calculates the customer tier based on total earned tokens.
 *
 * This function matches the Rust program's calculate_tier function to
 * ensure consistency between frontend and backend tier calculations.
 *
 * @param totalEarned - Total number of loyalty tokens earned by the customer
 * @returns The tier name corresponding to the total earned tokens
 *
 * @example
 * ```ts
 * const tier = calculateTier(5000); // Returns "silver"
 * const tier = calculateTier(50000); // Returns "platinum"
 * ```
 */
export function calculateTier(totalEarned: number): TierName {
  if (totalEarned >= 50000) return "platinum";
  if (totalEarned >= 10000) return "gold";
  if (totalEarned >= 1000) return "silver";
  return "bronze";
}

/**
 * Extracts tier information from the program's tier enum.
 *
 * The Anchor program returns tiers as enum objects (e.g., { bronze: {} }),
 * this function converts them to TierInfo objects.
 *
 * @param tier - Tier enum from the Anchor program
 * @returns TierInfo object with tier details
 *
 * @example
 * ```ts
 * const tierEnum = { silver: {} }; // From Anchor program
 * const tierInfo = getTierInfo(tierEnum);
 * // Returns: { name: "silver", displayName: "Silver", min: 1000, ... }
 * ```
 */
export function getTierInfo(tier: any): TierInfo {
  // Handle the enum format from Anchor: { bronze: {} } or { silver: {} } etc.
  const tierName = Object.keys(tier)[0]?.toLowerCase() as TierName;
  return TIER_THRESHOLDS[tierName] || TIER_THRESHOLDS.bronze;
}

/**
 * Calculates progress towards the next tier.
 *
 * @param totalEarned - Total number of loyalty tokens earned
 * @param currentTier - Current tier information
 * @returns Object containing progress percentage and tokens needed for next tier
 *
 * @example
 * ```ts
 * const tierInfo = TIER_THRESHOLDS.silver;
 * const { progress, tokensNeeded } = calculateTierProgress(5000, tierInfo);
 * // Returns: { progress: 44.44, tokensNeeded: 5000 }
 * ```
 */
export function calculateTierProgress(
  totalEarned: number,
  currentTier: TierInfo,
) {
  if (!currentTier.next) {
    return { progress: 100, tokensNeeded: 0 };
  }

  const progress =
    ((totalEarned - currentTier.min) /
      (currentTier.max - currentTier.min + 1)) *
    100;
  const tokensNeeded = currentTier.max + 1 - totalEarned;

  return {
    progress: Math.min(Math.max(progress, 0), 100),
    tokensNeeded: Math.max(tokensNeeded, 0),
  };
}
