"use client";

import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Custom hook to initialize and access the Solcity Anchor program.
 *
 * This hook creates an Anchor program instance using the connected wallet
 * and Solana connection. It memoizes the program instance to prevent
 * unnecessary re-initialization when dependencies haven't changed.
 *
 * The program instance is used by all other hooks to interact with the
 * Solcity smart contract on the Solana blockchain.
 *
 * @returns {Object} Program instance and wallet
 * @returns {Program|null} program - The Anchor program instance, or null if wallet not connected
 * @returns {AnchorWallet|undefined} wallet - The connected Anchor wallet
 *
 * @example
 * ```tsx
 * const { program, wallet } = useSolcityProgram();
 *
 * if (!program) {
 *   return <div>Please connect your wallet</div>;
 * }
 *
 * // Use program to interact with the smart contract
 * const merchantAccount = await program.account.merchant.fetch(merchantPDA);
 * ```
 */
export function useSolcityProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    return getProgram(provider);
  }, [connection, wallet]);

  return { program, wallet };
}
