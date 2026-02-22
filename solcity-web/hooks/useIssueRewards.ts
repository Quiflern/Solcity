"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMintPDA, getMerchantPDA, getCustomerPDA } from "@/lib/anchor/pdas";

export function useIssueRewards() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCustomer = async (customerWallet: PublicKey) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [customer] = getCustomerPDA(customerWallet, loyaltyProgram);

      // Check if customer already exists
      const customerAccount = await connection.getAccountInfo(customer);
      if (customerAccount) {
        console.log("Customer already registered");
        return { customer, loyaltyProgram };
      }

      console.log("Registering new customer...");
      const tx = await program.methods
        .registerCustomer()
        .accounts({
          customerAuthority: customerWallet,
          loyaltyProgram: loyaltyProgram,
        } as any)
        .rpc();

      console.log("Register customer tx:", tx);

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { customer, loyaltyProgram };
    } catch (err: any) {
      console.error("Error registering customer:", err);
      throw err;
    }
  };

  const issueRewards = async (
    customerWallet: PublicKey,
    purchaseAmount: number
  ) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
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

      // Pass purchase amount as-is (in dollars)
      // The Rust code will handle the conversion
      const purchaseAmountBN = new BN(purchaseAmount);

      const tx = await program.methods
        .issueRewards(purchaseAmountBN)
        .accounts({
          merchantAuthority: publicKey,
          merchant: merchant,
          customer: customer,
          loyaltyProgram: loyaltyProgram,
          mint: mint,
          customerTokenAccount: customerTokenAccount,
          platformTreasury: platformTreasury,
        } as any)
        .rpc();

      console.log("Issue rewards tx:", tx);

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, customerTokenAccount };
    } catch (err: any) {
      console.error("Error issuing rewards:", err);
      setError(err.message || "Failed to issue rewards");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    issueRewards,
    registerCustomer,
    isLoading,
    error,
  };
}
