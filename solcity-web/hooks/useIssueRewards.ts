"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMintPDA, getMerchantPDA, getCustomerPDA, getRewardRulePDA } from "@/lib/anchor/pdas";

export function useIssueRewards() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ customerWallet, purchaseAmount, ruleId }: {
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

      // Check if customer is registered
      const customerAccount = await connection.getAccountInfo(customer);
      if (!customerAccount) {
        throw new Error("Customer not registered. They must register themselves first by visiting the merchant's page.");
      }

      // Fetch loyalty program to get treasury
      const loyaltyProgramAccount = await program.account.loyaltyProgram.fetch(loyaltyProgram);
      const platformTreasury = loyaltyProgramAccount.treasury;

      // Get customer's token account
      const customerTokenAccount = getAssociatedTokenAddressSync(
        mint,
        customerWallet,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // Pass purchase amount as-is (in dollars) - ensure it's an integer
      const purchaseAmountBN = new BN(Math.floor(purchaseAmount));

      // Build accounts object
      // When no rule is selected, pass SystemProgram as the reward_rule account
      const accounts: any = {
        merchantAuthority: publicKey,
        merchant: merchant,
        customer: customer,
        loyaltyProgram: loyaltyProgram,
        mint: mint,
        customerTokenAccount: customerTokenAccount,
        platformTreasury: platformTreasury,
        rewardRule: ruleId !== undefined && ruleId !== null
          ? getRewardRulePDA(merchant, ruleId)[0]
          : SystemProgram.programId, // Pass SystemProgram when no rule
      };

      // Build the method call
      const ruleIdParam = ruleId !== undefined && ruleId !== null ? new BN(ruleId) : null;
      const methodBuilder = program.methods
        .issueRewards(purchaseAmountBN, ruleIdParam)
        .accountsPartial(accounts);

      const tx = await methodBuilder.rpc();

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
    onSuccess: (data) => {
      // Invalidate and refetch merchant data
      queryClient.invalidateQueries({ queryKey: ["merchant", publicKey?.toString()] });

      // Invalidate transactions to show the new one
      const merchantPDA = publicKey ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0] : null;
      if (merchantPDA) {
        queryClient.invalidateQueries({ queryKey: ["merchantTransactions", merchantPDA.toString()] });
      }
    },
  });

  // Keep backward compatibility
  const issueRewards = async (customerWallet: PublicKey, purchaseAmount: number, ruleId?: number) => {
    return mutation.mutateAsync({ customerWallet, purchaseAmount, ruleId });
  };

  return {
    issueRewards,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    mutation,
  };
}
