"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useSolcityProgram } from "./useSolcityProgram";
import { useQuery } from "@tanstack/react-query";

interface RewardRule {
  publicKey: PublicKey;
  merchant: PublicKey;
  ruleId: number;
  name: string;
  ruleType: any;
  multiplier: number;
  minPurchase: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

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

        console.log("All rules fetched:", allRules.length);
        console.log("First rule sample:", allRules[0]);
        console.log("First rule account:", allRules[0]?.account);
        console.log("First rule ruleId type:", typeof allRules[0]?.account?.ruleId);
        console.log("First rule ruleId value:", allRules[0]?.account?.ruleId);

        // Filter rules for this merchant
        const merchantRules = allRules
          .filter((rule) => {
            if (!rule || !rule.account) {
              console.warn("Invalid rule found:", rule);
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
                ruleId: typeof account.ruleId === 'number' ? account.ruleId : account.ruleId?.toNumber?.() || 0,
                name: account.name || "",
                ruleType: account.ruleType,
                multiplier: typeof account.multiplier === 'number' ? account.multiplier : account.multiplier?.toNumber?.() || 0,
                minPurchase: typeof account.minPurchase === 'number' ? account.minPurchase : account.minPurchase?.toNumber?.() || 0,
                startTime: typeof account.startTime === 'number' ? account.startTime : account.startTime?.toNumber?.() || 0,
                endTime: typeof account.endTime === 'number' ? account.endTime : account.endTime?.toNumber?.() || 0,
                isActive: account.isActive || false,
              };
            } catch (err) {
              console.error("Error mapping rule:", err, rule);
              return null;
            }
          })
          .filter((rule): rule is RewardRule => rule !== null);

        console.log("Merchant rules:", merchantRules.length);
        return merchantRules;
      } catch (err) {
        console.error("Error fetching merchant reward rules:", err);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}
