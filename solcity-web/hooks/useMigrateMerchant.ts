"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

export function useMigrateMerchant() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const migrateMerchant = async (avatarUrl: string) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, we need to get the merchant account to read its loyalty_program field
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

      // Fetch the raw account data to get the loyalty_program pubkey
      const accountInfo = await connection.getAccountInfo(merchant);
      if (!accountInfo) {
        throw new Error("Merchant account not found");
      }

      const tx = await program.methods
        .migrateMerchant(avatarUrl)
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
        })
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to migrate merchant");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    migrateMerchant,
    isLoading,
    error,
  };
}
