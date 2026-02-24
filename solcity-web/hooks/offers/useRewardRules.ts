"use client";

import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  getLoyaltyProgramPDA,
  getMerchantPDA,
  getRewardRulePDA,
} from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Rule type variants for different reward calculation methods.
 */
export type RuleType =
  | { baseReward: {} }
  | { bonusMultiplier: {} }
  | { firstPurchaseBonus: {} }
  | { referralBonus: {} }
  | { tierBonus: {} }
  | { streakBonus: {} };

/**
 * Parameters for creating a new reward rule.
 */
export interface RewardRuleParams {
  /** Unique identifier for this rule */
  ruleId: number;
  /** Name of the reward rule */
  name: string;
  /** Type of rule (base reward, bonus multiplier, etc.) */
  ruleType: RuleType;
  /** Multiplier applied to rewards (100 = 1x, 200 = 2x, etc.) */
  multiplier: number;
  /** Minimum purchase amount in cents to trigger this rule */
  minPurchase: number;
  /** Optional start time (Unix timestamp, 0 = immediate) */
  startTime?: number;
  /** Optional end time (Unix timestamp, 0 = no expiry) */
  endTime?: number;
}

/**
 * Parameters for updating an existing reward rule.
 */
export interface UpdateRewardRuleParams {
  /** Rule ID to update */
  ruleId: number;
  /** New name (optional) */
  name?: string;
  /** New rule type (optional) */
  ruleType?: RuleType;
  /** New multiplier (optional) */
  multiplier?: number;
  /** New minimum purchase (optional) */
  minPurchase?: number;
  /** New start time (optional) */
  startTime?: number;
  /** New end time (optional) */
  endTime?: number;
}

/**
 * Custom hook for managing reward rules.
 *
 * This hook provides functions to create, update, toggle, delete, and fetch
 * reward rules for a merchant. Reward rules define special conditions that
 * modify the base loyalty point calculation (e.g., double points on weekends,
 * bonus for first purchase, etc.).
 *
 * All operations require a connected wallet and automatically handle
 * transaction confirmation.
 *
 * @returns {Object} Reward rule management functions and state
 * @returns {Function} createRewardRule - Create a new reward rule
 * @returns {Function} updateRewardRule - Update an existing rule
 * @returns {Function} toggleRewardRule - Enable/disable a rule
 * @returns {Function} deleteRewardRule - Delete a rule permanently
 * @returns {Function} fetchRewardRule - Fetch a specific rule's data
 * @returns {boolean} isLoading - Whether an operation is in progress
 * @returns {string|null} error - Error message if operation failed
 *
 * @example
 * ```tsx
 * const { createRewardRule, isLoading, error } = useRewardRules();
 *
 * const handleCreate = async () => {
 *   try {
 *     await createRewardRule({
 *       ruleId: 1,
 *       name: "Weekend Bonus",
 *       ruleType: { bonusMultiplier: {} },
 *       multiplier: 200, // 2x points
 *       minPurchase: 1000 // $10 minimum
 *     });
 *   } catch (err) {
 *     console.error('Failed to create rule:', err);
 *   }
 * };
 * ```
 */
export function useRewardRules() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new reward rule for the merchant.
   *
   * @param params - Reward rule parameters
   * @returns Transaction signature and reward rule PDA
   * @throws Error if wallet is not connected or transaction fails
   */
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
          endTimeBN,
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

  /**
   * Updates an existing reward rule.
   *
   * Only the fields provided in params will be updated. Other fields
   * remain unchanged.
   *
   * @param params - Update parameters (ruleId is required to identify the rule)
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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
      const minPurchaseBN = params.minPurchase
        ? new BN(params.minPurchase)
        : null;
      const startTimeBN =
        params.startTime !== undefined ? new BN(params.startTime) : null;
      const endTimeBN =
        params.endTime !== undefined ? new BN(params.endTime) : null;

      const tx = await program.methods
        .updateRewardRule(
          ruleIdBN,
          params.name || null,
          params.ruleType || null,
          multiplierBN,
          minPurchaseBN,
          startTimeBN,
          endTimeBN,
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

  /**
   * Toggles the active status of a reward rule.
   *
   * @param ruleId - ID of the rule to toggle
   * @param isActive - New active status (true to activate, false to deactivate)
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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

  /**
   * Permanently deletes a reward rule.
   *
   * This action cannot be undone. The rule account will be closed and
   * rent will be returned to the merchant.
   *
   * @param ruleId - ID of the rule to delete
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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

  /**
   * Fetches a specific reward rule's data from the blockchain.
   *
   * @param ruleId - ID of the rule to fetch
   * @returns Reward rule account data, or null if not found
   */
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
