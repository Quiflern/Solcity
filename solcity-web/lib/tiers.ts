/**
 * Tier thresholds and utilities based on the Solana program
 * These values must match the Rust program's tier calculation
 */

export type TierName = "bronze" | "silver" | "gold" | "platinum";

export interface TierInfo {
  name: TierName;
  displayName: string;
  min: number;
  max: number;
  next: string | null;
  multiplier: number; // e.g., 1.25 for 1.25x
}

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
 * Calculate tier based on total earned tokens
 * This matches the Rust program's calculate_tier function
 */
export function calculateTier(totalEarned: number): TierName {
  if (totalEarned >= 50000) return "platinum";
  if (totalEarned >= 10000) return "gold";
  if (totalEarned >= 1000) return "silver";
  return "bronze";
}

/**
 * Get tier info from the program's tier enum
 */
export function getTierInfo(tier: any): TierInfo {
  // Handle the enum format from Anchor: { bronze: {} } or { silver: {} } etc.
  const tierName = Object.keys(tier)[0]?.toLowerCase() as TierName;
  return TIER_THRESHOLDS[tierName] || TIER_THRESHOLDS.bronze;
}

/**
 * Calculate progress to next tier
 */
export function calculateTierProgress(totalEarned: number, currentTier: TierInfo) {
  if (!currentTier.next) {
    return { progress: 100, tokensNeeded: 0 };
  }

  const progress =
    ((totalEarned - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100;
  const tokensNeeded = currentTier.max + 1 - totalEarned;

  return {
    progress: Math.min(Math.max(progress, 0), 100),
    tokensNeeded: Math.max(tokensNeeded, 0),
  };
}
