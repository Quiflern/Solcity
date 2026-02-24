"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyProgramPDA } from "@/lib/anchor/pdas";
import { useSolcityProgram } from "./useSolcityProgram";

/**
 * Custom hook to fetch the loyalty program account for the connected wallet.
 *
 * This hook retrieves the loyalty program account associated with the
 * connected wallet's public key. The loyalty program is the top-level
 * account that manages the entire loyalty system including merchants,
 * customers, and the token mint.
 *
 * The hook automatically refetches when the wallet changes and handles
 * errors gracefully by returning null if the account doesn't exist or
 * if there's an error fetching it.
 *
 * @returns {Object} Loyalty program data and query state
 * @returns {Object|null} loyaltyProgram - The loyalty program account data, or null if not found
 * @returns {boolean} isLoading - Whether the query is currently loading
 * @returns {Error|null} error - Any error that occurred during the query
 *
 * @example
 * ```tsx
 * const { loyaltyProgram, isLoading, error } = useLoyaltyProgram();
 *
 * if (isLoading) return <div>Loading program...</div>;
 * if (error) return <div>Error loading program</div>;
 * if (!loyaltyProgram) return <div>No loyalty program found</div>;
 *
 * return (
 *   <div>
 *     <h1>{loyaltyProgram.name}</h1>
 *     <p>Authority: {loyaltyProgram.authority.toString()}</p>
 *   </div>
 * );
 * ```
 */
export function useLoyaltyProgram() {
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error } = useQuery({
    queryKey: ["loyaltyProgram", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return null;
      }

      try {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const account =
          await program.account.loyaltyProgram.fetchNullable(loyaltyProgram);
        return account;
      } catch (err) {
        console.error("Error fetching loyalty program:", err);
        return null;
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    loyaltyProgram: data,
    isLoading,
    error,
  };
}
