"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMerchantPDA, getRewardRulePDA } from "@/lib/anchor/pdas";

export type RuleType =
  | { baseReward: {} }
  | { bonusMultiplier: {} }
  | { firstPurchaseBonus: {} }
  | { referralBonus: {} }
  | { tierBonus: {} }
  | { streakBonus: {} };

export interface RewardRuleParams {
  ruleId: number;
  ruleType: RuleType;
  multiplier: number; // 100 = 1x, 200 = 2x, etc.
  minPurchase: number; // in cents
  startTime?: number; // Unix timestamp, 0 = immediate
  endTime?: number; // Unix timestamp, 0 = no expiry
}

export function useRewardRules() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRewardRule = async (params: RewardRuleParams) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [rewardRule] = getRewardRulePDA(merchant, params.ruleId);

      // Convert to BN for Anchor
      const ruleIdBN = new BN(params.ruleId);
      const multiplierBN = new BN(params.multiplier);
      const minPurchaseBN = new BN(params.minPurchase);
      const startTimeBN = new BN(params.startTime || 0);
      const endTimeBN = new BN(params.endTime || 0);

      const tx = await program.methods
        .setRewardRule(
          ruleIdBN,
          params.ruleType,
          multiplierBN,
          minPurchaseBN,
          startTimeBN,
          endTimeBN
        )
        .accounts({
          merchantAuthority: publicKey,
        })
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, rewardRule };
    } catch (err: any) {
      setError(err.message || "Failed to create reward rule");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRewardRule = async (ruleId: number) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [rewardRule] = getRewardRulePDA(merchant, ruleId);

      const ruleAccount = await program.account.rewardRule.fetch(rewardRule);
      return ruleAccount;
    } catch (err: any) {
      return null;
    }
  };

  return {
    createRewardRule,
    fetchRewardRule,
    isLoading,
    error,
  };
}
