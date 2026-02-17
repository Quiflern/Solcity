"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";

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
      const tx = await program.methods
        .migrateMerchant(avatarUrl)
        .accounts({
          merchantAuthority: publicKey,
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
