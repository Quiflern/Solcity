"use client";

import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  getLoyaltyProgramPDA,
  getMerchantPDA,
  getMintPDA,
} from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to handle merchant registration in the Solcity protocol.
 *
 * This hook provides three functions for the merchant registration flow:
 * 1. initializeProgram - Creates a new loyalty program
 * 2. registerMerchant - Registers a merchant in an existing loyalty program
 * 3. registerComplete - Complete registration flow (initializes if needed, then registers)
 *
 * The hook manages loading state and error handling for all registration operations.
 *
 * @returns {Object} Registration functions and state
 * @returns {Function} initializeProgram - Initialize a new loyalty program
 * @returns {Function} registerMerchant - Register as a merchant
 * @returns {Function} registerComplete - Complete registration (recommended)
 * @returns {boolean} isLoading - Whether a registration operation is in progress
 * @returns {string|null} error - Error message if registration failed
 *
 * @example
 * ```tsx
 * const { registerComplete, isLoading, error } = useMerchantRegister();
 *
 * const handleRegister = async () => {
 *   try {
 *     const result = await registerComplete(
 *       "My Loyalty Program",
 *       "My Business",
 *       "https://example.com/avatar.png",
 *       "Restaurant",
 *       "Best food in town",
 *       100 // reward rate
 *     );
 *     console.log('Registered:', result);
 *   } catch (error) {
 *     console.error('Registration failed:', error);
 *   }
 * };
 * ```
 */
export function useMerchantRegister() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeProgram = async (
    programName: string,
    interestRate?: number,
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

  /**
   * Registers the connected wallet as a merchant in the loyalty program.
   *
   * The loyalty program must already exist before calling this function.
   *
   * @param businessName - Name of the business
   * @param avatarUrl - URL to business logo/avatar
   * @param category - Business category (e.g., "Restaurant", "Retail")
   * @param description - Business description
   * @param rewardRate - Base reward rate (tokens per dollar spent)
   * @returns Transaction signature, merchant PDA, and loyalty program PDA
   */
  const registerMerchant = async (
    businessName: string,
    avatarUrl: string,
    category: string,
    description: string,
    rewardRate: number,
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
      const loyaltyProgramAccount =
        await program.account.loyaltyProgram.fetch(loyaltyProgram);
      const platformTreasury = loyaltyProgramAccount.treasury;

      // Convert to BN for Anchor
      const rewardRateBN = new BN(rewardRate);

      const tx = await program.methods
        .registerMerchant(
          businessName,
          avatarUrl,
          category,
          description || null,
          rewardRateBN,
        )
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

  /**
   * Complete merchant registration flow.
   *
   * This function handles the entire registration process:
   * 1. Checks if loyalty program exists
   * 2. Initializes program if it doesn't exist
   * 3. Registers the merchant
   *
   * This is the recommended function to use for new merchant registration.
   *
   * @param programName - Name of the loyalty program
   * @param businessName - Name of the business
   * @param avatarUrl - URL to business logo/avatar
   * @param category - Business category
   * @param description - Business description
   * @param rewardRate - Base reward rate
   * @param interestRate - Optional interest rate for the program
   * @returns Combined result with all PDAs and transaction signatures
   */
  const registerComplete = async (
    programName: string,
    businessName: string,
    avatarUrl: string,
    category: string,
    description: string,
    rewardRate: number,
    interestRate?: number,
  ) => {
    if (!publicKey || !program) {
      throw new Error("Wallet not connected");
    }

    const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);

    // Check if program already exists
    let initResult;
    try {
      // Try to fetch the loyalty program account
      const loyaltyProgramAccount =
        await program.account.loyaltyProgram.fetchNullable(loyaltyProgram);

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
        if (
          initErr.message?.includes("already in use") ||
          initErr.message?.includes("custom program error: 0x0")
        ) {
          const [mint] = getMintPDA(loyaltyProgram);
          initResult = { signature: "", loyaltyProgram, mint };
        } else {
          throw initErr;
        }
      }
    }

    // Then register the merchant
    const merchantResult = await registerMerchant(
      businessName,
      avatarUrl,
      category,
      description,
      rewardRate,
    );

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
