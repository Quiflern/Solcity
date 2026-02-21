"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { useSolcityProgram } from "./useSolcityProgram";
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

      console.log("Initialize program tx:", tx);

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, loyaltyProgram, mint };
    } catch (err: any) {
      console.error("Error initializing program:", err);
      setError(err.message || "Failed to initialize program");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerMerchant = async (
    businessName: string,
    avatarUrl: string,
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
        .registerMerchant(businessName, avatarUrl, description || null, rewardRateBN)
        .accounts({
          merchantAuthority: publicKey,
          loyaltyProgram: loyaltyProgram,
          platformTreasury: platformTreasury,
        } as any)
        .rpc();

      console.log("Register merchant tx:", tx);

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, merchant, loyaltyProgram };
    } catch (err: any) {
      console.error("Error registering merchant:", err);
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
    description: string,
    rewardRate: number,
    interestRate?: number
  ) => {
    if (!publicKey) {
      throw new Error("Wallet not connected");
    }

    const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);

    // Check if program already exists
    let initResult;
    try {
      const accountInfo = await connection.getAccountInfo(loyaltyProgram);
      if (accountInfo) {
        console.log("Loyalty program already exists, skipping initialization");
        const [mint] = getMintPDA(loyaltyProgram);
        initResult = { signature: "", loyaltyProgram, mint };
      } else {
        // Initialize the program
        initResult = await initializeProgram(programName, interestRate);
      }
    } catch (err) {
      console.log("Error checking program, attempting to initialize:", err);
      initResult = await initializeProgram(programName, interestRate);
    }

    // Then register the merchant
    const merchantResult = await registerMerchant(businessName, avatarUrl, description, rewardRate);

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
