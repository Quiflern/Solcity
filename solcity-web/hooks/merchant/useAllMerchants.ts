"use client";

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import IDL_JSON from "@/lib/anchor/idl/solcity_protocol.json";
import type { SolcityProtocol } from "@/lib/anchor/types/solcity_protocol";

/**
 * Represents a merchant in the Solcity loyalty program.
 *
 * Contains all public information about a merchant including their
 * business details, reward configuration, and activity statistics.
 */
export interface MerchantData {
  /** Public key of the merchant account */
  publicKey: PublicKey;
  /** Public key of the merchant's authority (wallet) */
  authority: PublicKey;
  /** Public key of the loyalty program this merchant belongs to */
  loyaltyProgram: PublicKey;
  /** Business name of the merchant */
  name: string;
  /** Business category (e.g., "Restaurant", "Retail") */
  category: string;
  /** URL to the merchant's avatar/logo image */
  avatarUrl: string;
  /** Base reward rate (tokens per dollar spent) */
  rewardRate: number;
  /** Total loyalty tokens issued by this merchant */
  totalIssued: number;
  /** Total loyalty tokens redeemed at this merchant */
  totalRedeemed: number;
  /** Whether the merchant is currently active */
  isActive: boolean;
  /** Unix timestamp when the merchant was created */
  createdAt: number;
}

/**
 * Custom hook to fetch all registered merchants in the Solcity protocol.
 *
 * This hook creates a read-only connection to the blockchain and fetches
 * all merchant accounts. No wallet connection is required since it only
 * reads public data. Merchants are sorted by creation date (newest first).
 *
 * @returns {Object} Merchant data and loading state
 * @returns {MerchantData[]} merchants - Array of all registered merchants
 * @returns {boolean} isLoading - Whether the data is currently loading
 * @returns {string|null} error - Error message if fetch failed, null otherwise
 *
 * @example
 * ```tsx
 * const { merchants, isLoading, error } = useAllMerchants();
 *
 * if (isLoading) return <div>Loading merchants...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 * return (
 *   <div>
 *     {merchants.map(merchant => (
 *       <MerchantCard key={merchant.publicKey.toString()} merchant={merchant} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useAllMerchants() {
  const { connection } = useConnection();
  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setIsLoading(true);

        // Create a read-only wallet for public data access
        const readOnlyWallet = {
          publicKey: null,
          signTransaction: async () => {
            throw new Error("Read-only wallet cannot sign");
          },
          signAllTransactions: async () => {
            throw new Error("Read-only wallet cannot sign");
          },
        } as unknown as Wallet;

        // Create a read-only provider (no wallet needed for public data)
        const provider = new AnchorProvider(
          connection,
          readOnlyWallet,
          { commitment: "confirmed" },
        );

        const program = new Program<SolcityProtocol>(
          IDL_JSON as SolcityProtocol,
          provider,
        );

        // Fetch all merchant accounts from the blockchain
        const merchantAccounts = await program.account.merchant.all();

        // Transform blockchain data into a more usable format
        const merchantsData: MerchantData[] = merchantAccounts.map(
          (account) => ({
            publicKey: account.publicKey,
            authority: account.account.authority,
            loyaltyProgram: account.account.loyaltyProgram,
            name: account.account.name,
            category: account.account.category || "Other",
            avatarUrl: account.account.avatarUrl || "",
            rewardRate: account.account.rewardRate,
            totalIssued: account.account.totalIssued,
            totalRedeemed: account.account.totalRedeemed,
            isActive: account.account.isActive,
            createdAt: account.account.createdAt,
          }),
        );

        // Sort by creation date (newest first)
        merchantsData.sort((a, b) => b.createdAt - a.createdAt);

        setMerchants(merchantsData);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch merchants";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchants();
  }, [connection]);

  return {
    merchants,
    isLoading,
    error,
  };
}
