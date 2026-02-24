"use client";

import { BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { type PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerPDA,
  getLoyaltyProgramPDA,
  getMerchantPDA,
  getMintPDA,
  getRewardRulePDA,
} from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to issue loyalty rewards to customers.
 *
 * This hook handles the complete reward issuance flow:
 * 1. Validates customer registration
 * 2. Calculates reward amount based on purchase amount, tier, and optional rule
 * 3. Mints loyalty tokens to customer's account
 * 4. Updates merchant and customer statistics
 * 5. Provides optimistic UI updates for instant feedback
 *
 * The hook includes optimistic updates that show pending transactions immediately
 * in the UI before blockchain confirmation, then replaces them with real data.
 *
 * @returns {Object} Issue rewards functionality and state
 * @returns {Function} issueRewards - Async function to issue rewards to a customer
 * @returns {boolean} isLoading - Whether a reward issuance is in progress
 * @returns {string|null} error - Error message if issuance failed
 * @returns {Object} mutation - React Query mutation object for advanced usage
 *
 * @example
 * ```tsx
 * const { issueRewards, isLoading, error } = useIssueRewards();
 *
 * const handleIssue = async () => {
 *   try {
 *     const result = await issueRewards(
 *       customerWallet,
 *       50.00, // $50 purchase
 *       1 // Optional rule ID
 *     );
 *     console.log('Rewards issued:', result.signature);
 *   } catch (error) {
 *     console.error('Failed to issue rewards:', error);
 *   }
 * };
 * ```
 */
export function useIssueRewards() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      customerWallet,
      purchaseAmount,
      ruleId,
    }: {
      customerWallet: PublicKey;
      purchaseAmount: number;
      ruleId?: number;
    }) => {
      if (!program || !publicKey) {
        throw new Error("Wallet not connected");
      }

      const [loyaltyProgramFromAuthority] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgramFromAuthority);

      // Fetch merchant account to get the actual loyalty program
      const merchantAccount = await program.account.merchant.fetch(merchant);
      const loyaltyProgram = merchantAccount.loyaltyProgram;

      const [customer] = getCustomerPDA(customerWallet, loyaltyProgram);
      const [mint] = getMintPDA(loyaltyProgram);

      // Verify customer is registered before issuing rewards
      const customerAccount = await connection.getAccountInfo(customer);
      if (!customerAccount) {
        throw new Error(
          "Customer not registered. They must register themselves first by visiting the merchant's page.",
        );
      }

      // Fetch loyalty program to get treasury
      const loyaltyProgramAccount =
        await program.account.loyaltyProgram.fetch(loyaltyProgram);
      const platformTreasury = loyaltyProgramAccount.treasury;

      // Get customer's token account
      const customerTokenAccount = getAssociatedTokenAddressSync(
        mint,
        customerWallet,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      // Convert purchase amount from dollars to cents for the program
      // The program expects amounts in cents (e.g., 1000 = $10.00)
      const purchaseAmountCents = Math.floor(purchaseAmount * 100);
      const purchaseAmountBN = new BN(purchaseAmountCents);

      // Determine reward rule account
      // When no rule is selected, pass SystemProgram as the reward_rule account
      let rewardRuleAccount: PublicKey;
      if (ruleId !== undefined && ruleId !== null) {
        rewardRuleAccount = getRewardRulePDA(merchant, ruleId)[0];
      } else {
        rewardRuleAccount = SystemProgram.programId;
      }

      // Build accounts object for the transaction
      const accounts = {
        merchantAuthority: publicKey,
        merchant: merchant,
        customer: customer,
        loyaltyProgram: loyaltyProgram,
        mint: mint,
        customerTokenAccount: customerTokenAccount,
        platformTreasury: platformTreasury,
        rewardRule: rewardRuleAccount,
      };

      // Execute the issue rewards transaction
      const ruleIdParam =
        ruleId !== undefined && ruleId !== null ? new BN(ruleId) : null;

      const tx = await program.methods
        .issueRewards(purchaseAmountBN, ruleIdParam)
        .accountsPartial(accounts)
        .rpc();

      // Wait for transaction confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return {
        signature: tx,
        customerTokenAccount,
        customerWallet: customerWallet.toString(),
        amount: purchaseAmount,
      };
    },
    onSuccess: async () => {
      // Wait for blockchain to index the transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Remove the pending optimistic update before fetching real data
      if (publicKey) {
        queryClient.setQueryData(
          ["merchantIssuanceEvents", publicKey.toString()],
          (old: unknown) => {
            if (!old || !Array.isArray(old)) return old;
            // Remove pending transactions
            return old.filter((event) => event.signature !== "pending");
          },
        );
      }

      // Invalidate and refetch merchant data to reflect new statistics
      queryClient.invalidateQueries({
        queryKey: ["merchant", publicKey?.toString()],
      });

      // Invalidate transactions and events to show the new issuance
      if (publicKey) {
        queryClient.invalidateQueries({
          queryKey: ["merchantTransactions", publicKey.toString()],
        });
        queryClient.invalidateQueries({
          queryKey: ["merchantIssuanceEvents", publicKey.toString()],
        });
      }
    },
    onMutate: async ({ customerWallet, purchaseAmount, ruleId }) => {
      // Optimistically update the UI before the transaction completes
      // This provides instant feedback to the user
      if (!publicKey) return;

      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ["merchantIssuanceEvents", publicKey.toString()],
      });

      // Snapshot the previous value for rollback on error
      const previousEvents = queryClient.getQueryData([
        "merchantIssuanceEvents",
        publicKey.toString(),
      ]);

      // Add a temporary "pending" event to the UI
      queryClient.setQueryData(
        ["merchantIssuanceEvents", publicKey.toString()],
        (old: unknown) => {
          // Create temporary event with approximate values
          const tempEvent = {
            signature: "pending",
            timestamp: Date.now() / 1000,
            customerWallet: customerWallet.toString(),
            amount: Math.floor(purchaseAmount * 1.0), // Approximate, will be updated
            purchaseAmount: purchaseAmount,
            tierMultiplier: 1.0,
            ruleMultiplier: 1.0,
            ruleApplied: !!ruleId,
            customerTier: "Bronze",
          };

          // If no old data, return array with just the temp event
          if (!old || !Array.isArray(old)) {
            return [tempEvent];
          }

          return [tempEvent, ...old];
        },
      );

      // Return context with the previous value for rollback
      return { previousEvents };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, roll back to the previous value
      // This removes the optimistic "pending" event
      if (publicKey && context?.previousEvents) {
        queryClient.setQueryData(
          ["merchantIssuanceEvents", publicKey.toString()],
          context.previousEvents,
        );
      }
    },
  });

  /**
   * Issues loyalty rewards to a customer for a purchase.
   *
   * @param customerWallet - Public key of the customer's wallet
   * @param purchaseAmount - Purchase amount in dollars (e.g., 50.00)
   * @param ruleId - Optional reward rule ID to apply bonus multiplier
   * @returns Transaction signature and customer token account
   */
  const issueRewards = async (
    customerWallet: PublicKey,
    purchaseAmount: number,
    ruleId?: number,
  ) => {
    return mutation.mutateAsync({ customerWallet, purchaseAmount, ruleId });
  };

  return {
    issueRewards,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    mutation,
  };
}
