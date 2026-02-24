"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to fetch and manage merchant account data for the connected wallet.
 *
 * This hook queries the blockchain for merchant account information associated with
 * the connected wallet. It checks if the wallet is registered as a merchant and
 * handles corrupted account data by allowing re-registration.
 *
 * The hook includes special logic to detect corrupted accounts (where createdAt or
 * bump fields are 0) and treats them as unregistered to allow recovery.
 *
 * @returns {Object} Merchant account data and query state
 * @returns {Object|null} merchantAccount - The merchant account data if found, null otherwise
 * @returns {boolean} isRegistered - Whether the wallet is registered as a merchant
 * @returns {boolean} isLoading - Whether the query is currently loading
 * @returns {Error|null} error - Any error that occurred during the query
 * @returns {Function} refetch - Function to manually refetch the merchant account data
 *
 * @example
 * ```tsx
 * const { merchantAccount, isRegistered, isLoading } = useMerchantAccount();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (!isRegistered) return <div>Please register as a merchant</div>;
 *
 * return (
 *   <div>
 *     <h1>{merchantAccount.name}</h1>
 *     <p>Reward Rate: {merchantAccount.rewardRate}</p>
 *   </div>
 * );
 * ```
 */
export function useMerchantAccount() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["merchant", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return { merchantAccount: null, isRegistered: false };
      }

      try {
        // Derive merchant PDA from wallet and loyalty program
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        // Attempt to fetch merchant account
        const account = await program.account.merchant.fetchNullable(merchant);

        if (account) {
          // Validate account data integrity
          // Check if account data is valid (not corrupted)
          if (account.createdAt === 0 || account.bump === 0) {
            // Corrupted account - treat as not registered to allow recovery
            return { merchantAccount: null, isRegistered: false };
          }
          return { merchantAccount: account, isRegistered: true };
        }
        return { merchantAccount: null, isRegistered: false };
      } catch (err) {
        // Additional check for corrupted accounts that can't be deserialized
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        try {
          const accountInfo = await connection.getAccountInfo(merchant);
          if (
            accountInfo &&
            accountInfo.owner.toString() === program.programId.toString()
          ) {
            // Account exists but can't be deserialized - treat as corrupted
            return { merchantAccount: null, isRegistered: false };
          }
        } catch {
          // Ignore secondary errors
        }
        return { merchantAccount: null, isRegistered: false };
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    merchantAccount: data?.merchantAccount || null,
    isRegistered: data?.isRegistered || false,
    isLoading,
    error,
    refetch,
  };
}
