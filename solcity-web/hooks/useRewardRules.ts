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
  name: string;
  ruleType: RuleType;
  multiplier: number; // 100 = 1x, 200 = 2x, etc.
  minPurchase: number; // in cents
  startTime?: number; // Unix timestamp, 0 = immediate
  endTime?: number; // Unix timestamp, 0 = no expiry
}

export interface UpdateRewardRuleParams {
  ruleId: number;
  name?: string;
  ruleType?: RuleType;
  multiplier?: number;
  minPurchase?: number;
  startTime?: number;
  endTime?: number;
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
          params.name,
          params.ruleType,
          multiplierBN,
          minPurchaseBN,
          startTimeBN,
          endTimeBN
        )
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
          rewardRule: rewardRule,
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

  const updateRewardRule = async (params: UpdateRewardRuleParams) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [rewardRule] = getRewardRulePDA(merchant, params.ruleId);

      const ruleIdBN = new BN(params.ruleId);
      const multiplierBN = params.multiplier ? new BN(params.multiplier) : null;
      const minPurchaseBN = params.minPurchase ? new BN(params.minPurchase) : null;
      const startTimeBN = params.startTime !== undefined ? new BN(params.startTime) : null;
      const endTimeBN = params.endTime !== undefined ? new BN(params.endTime) : null;

      const tx = await program.methods
        .updateRewardRule(
          ruleIdBN,
          params.name || null,
          params.ruleType || null,
          multiplierBN,
          minPurchaseBN,
          startTimeBN,
          endTimeBN
        )
        .accountsPartial({
          merchantAuthority: publicKey,
          loyaltyProgram: loyaltyProgram,
          merchant: merchant,
          rewardRule: rewardRule,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to update reward rule");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRewardRule = async (ruleId: number, isActive: boolean) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [rewardRule] = getRewardRulePDA(merchant, ruleId);

      const ruleIdBN = new BN(ruleId);

      const tx = await program.methods
        .toggleRewardRule(ruleIdBN, isActive)
        .accountsPartial({
          merchantAuthority: publicKey,
          loyaltyProgram: loyaltyProgram,
          merchant: merchant,
          rewardRule: rewardRule,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to toggle reward rule");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRewardRule = async (ruleId: number) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [rewardRule] = getRewardRulePDA(merchant, ruleId);

      const ruleIdBN = new BN(ruleId);

      const tx = await program.methods
        .deleteRewardRule(ruleIdBN)
        .accountsPartial({
          merchantAuthority: publicKey,
          loyaltyProgram: loyaltyProgram,
          merchant: merchant,
          rewardRule: rewardRule,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to delete reward rule");
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
    updateRewardRule,
    toggleRewardRule,
    deleteRewardRule,
    fetchRewardRule,
    isLoading,
    error,
  };
}
