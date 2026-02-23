"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useSolcityProgram } from "../program/useSolcityProgram";
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
