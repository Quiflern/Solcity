"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { getLoyaltyProgramPDA, getMintPDA, getMerchantPDA } from "@/lib/anchor/pdas";

export function useMerchantRegister() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeProgram = async (
    programName: string,
    interestRate?: number
  ) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [mint] = getMintPDA(loyaltyProgram);

      const tx = await program.methods
        .initializeProgram(programName, interestRate ?? null)
        .accounts({
          authority: publicKey,
        })
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, loyaltyProgram, mint };
    } catch (err: any) {
      setError(err.message || "Failed to initialize program");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerMerchant = async (
    businessName: string,
    avatarUrl: string,
    category: string,
    description: string,
    rewardRate: number
  ) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

      // Fetch loyalty program to get treasury address
      const loyaltyProgramAccount = await program.account.loyaltyProgram.fetch(loyaltyProgram);
      const platformTreasury = loyaltyProgramAccount.treasury;

      // Convert to BN for Anchor
      const rewardRateBN = new BN(rewardRate);

      const tx = await program.methods
        .registerMerchant(businessName, avatarUrl, category, description || null, rewardRateBN)
        .accounts({
          merchantAuthority: publicKey,
          loyaltyProgram: loyaltyProgram,
          platformTreasury: platformTreasury,
        } as any)
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, merchant, loyaltyProgram };
    } catch (err: any) {
      setError(err.message || "Failed to register merchant");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerComplete = async (
    programName: string,
    businessName: string,
    avatarUrl: string,
    category: string,
    description: string,
    rewardRate: number,
    interestRate?: number
  ) => {
    if (!publicKey || !program) {
      throw new Error("Wallet not connected");
    }

    const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);

    // Check if program already exists
    let initResult;
    try {
      // Try to fetch the loyalty program account
      const loyaltyProgramAccount = await program.account.loyaltyProgram.fetchNullable(loyaltyProgram);

      if (loyaltyProgramAccount) {
        const [mint] = getMintPDA(loyaltyProgram);
        initResult = { signature: "", loyaltyProgram, mint };
      } else {
        // Account doesn't exist, initialize the program
        initResult = await initializeProgram(programName, interestRate);
      }
    } catch (err: any) {
      // If fetch fails for any reason, try to initialize
      // This will fail gracefully if it already exists
      try {
        initResult = await initializeProgram(programName, interestRate);
      } catch (initErr: any) {
        // If initialization fails because it already exists, that's okay
        if (initErr.message?.includes("already in use") || initErr.message?.includes("custom program error: 0x0")) {
          const [mint] = getMintPDA(loyaltyProgram);
          initResult = { signature: "", loyaltyProgram, mint };
        } else {
          throw initErr;
        }
      }
    }

    // Then register the merchant
    const merchantResult = await registerMerchant(businessName, avatarUrl, category, description, rewardRate);

    return {
      ...initResult,
      ...merchantResult,
    };
  };

  return {
    initializeProgram,
    registerMerchant,
    registerComplete,
    isLoading,
    error,
  };
}
