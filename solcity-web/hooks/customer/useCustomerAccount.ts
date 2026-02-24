"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to fetch and manage customer account data from the Solcity protocol.
 *
 * This hook queries the blockchain for customer account information associated with
 * the connected wallet. It checks if the user is registered as a customer in any
 * loyalty program by searching for customer accounts where the wallet is the authority.
 *
 * @returns {Object} Customer account data and query state
 * @returns {Object|null} customerAccount - The customer account data if found, null otherwise
 * @returns {boolean} isRegistered - Whether the wallet is registered as a customer
 * @returns {boolean} isLoading - Whether the query is currently loading
 * @returns {Error|null} error - Any error that occurred during the query
 * @returns {Function} refetch - Function to manually refetch the customer account data
 *
 * @example
 * ```tsx
 * const { customerAccount, isRegistered, isLoading } = useCustomerAccount();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (!isRegistered) return <div>Please register first</div>;
 *
 * return <div>Points: {customerAccount.points}</div>;
 * ```
 */
export function useCustomerAccount() {
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customer", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return { customerAccount: null, isRegistered: false };
      }

      try {
        // Query all customer accounts where the connected wallet is the authority
        // Uses memcmp to filter by the customer authority field (offset 8 after discriminator)
        const accounts = await program.account.customer.all([
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        // If any customer account exists for this wallet, they are registered
        if (accounts.length > 0) {
          return { customerAccount: accounts[0].account, isRegistered: true };
        }
        return { customerAccount: null, isRegistered: false };
      } catch (err) {
        console.error("Error fetching customer account:", err);
        return { customerAccount: null, isRegistered: false };
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    customerAccount: data?.customerAccount || null,
    isRegistered: data?.isRegistered || false,
    isLoading,
    error,
    refetch,
  };
}
