"use client";

import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a reward rule that modifies loyalty point calculations.
 *
 * Reward rules allow merchants to create special promotions or bonuses
 * that multiply the base reward rate under certain conditions.
 */
interface RewardRule {
  /** Public key of the reward rule account */
  publicKey: PublicKey;
  /** Public key of the merchant who owns this rule */
  merchant: PublicKey;
  /** Unique identifier for this rule */
  ruleId: number;
  /** Name of the reward rule */
  name: string;
  /** Type of rule (e.g., time-based, purchase-based) */
  ruleType: any;
  /** Multiplier applied to base rewards (in basis points) */
  multiplier: number;
  /** Minimum purchase amount required to trigger this rule */
  minPurchase: number;
  /** Unix timestamp when the rule becomes active */
  startTime: number;
  /** Unix timestamp when the rule expires */
  endTime: number;
  /** Whether the rule is currently active */
  isActive: boolean;
}

/**
 * Custom hook to fetch all reward rules for a merchant.
 *
 * This hook queries the blockchain for all reward rule accounts owned by
 * the specified merchant. Reward rules are used to create special promotions
 * or bonus multipliers for loyalty point calculations.
 *
 * @param merchantPubkey - Public key of the merchant account
 * @returns {UseQueryResult<RewardRule[]>} React Query result containing reward rules
 *
 * @example
 * ```tsx
 * const { data: rules, isLoading } = useMerchantRewardRules(merchantPubkey);
 *
 * if (isLoading) return <div>Loading rules...</div>;
 *
 * return (
 *   <div>
 *     {rules?.map(rule => (
 *       <RuleCard key={rule.publicKey.toString()} rule={rule} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMerchantRewardRules(merchantPubkey: PublicKey | null) {
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["merchantRewardRules", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all reward rule accounts
        const allRules = await program.account.rewardRule.all();

        // Filter rules for this merchant
        const merchantRules = allRules
          .filter((rule) => {
            if (!rule || !rule.account) {
              return false;
            }
            return rule.account.merchant.equals(merchantPubkey);
          })
          .map((rule) => {
            try {
              const account = rule.account;
              return {
                publicKey: rule.publicKey,
                merchant: account.merchant,
                ruleId:
                  typeof account.ruleId === "number"
                    ? account.ruleId
                    : account.ruleId?.toNumber?.() || 0,
                name: account.name || "",
                ruleType: account.ruleType,
                multiplier:
                  typeof account.multiplier === "number"
                    ? account.multiplier
                    : account.multiplier?.toNumber?.() || 0,
                minPurchase:
                  typeof account.minPurchase === "number"
                    ? account.minPurchase
                    : account.minPurchase?.toNumber?.() || 0,
                startTime:
                  typeof account.startTime === "number"
                    ? account.startTime
                    : account.startTime?.toNumber?.() || 0,
                endTime:
                  typeof account.endTime === "number"
                    ? account.endTime
                    : account.endTime?.toNumber?.() || 0,
                isActive: account.isActive || false,
              };
            } catch (err) {
              return null;
            }
          })
          .filter((rule): rule is RewardRule => rule !== null);

        return merchantRules;
      } catch (err) {
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}
