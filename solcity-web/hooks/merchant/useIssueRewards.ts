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

      if (publicKey) {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        // Invalidate and refetch merchant data to reflect new statistics
        queryClient.invalidateQueries({
          queryKey: ["merchant", publicKey.toString()],
        });

        // Invalidate transaction records to show the new issuance
        queryClient.invalidateQueries({
          queryKey: ["merchantTransactionRecords", merchant.toString()],
        });

        // Invalidate customer records to update stats and chart
        queryClient.invalidateQueries({
          queryKey: ["merchantCustomerRecords", merchant.toString()],
        });
      }
    },
    onMutate: async () => {
      // No optimistic updates needed - we'll just refetch after success
      // Transaction records are fast and reliable from on-chain data
    },
    onError: () => {
      // No rollback needed since we're not doing optimistic updates
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
