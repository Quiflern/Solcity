"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a customer in the merchant's loyalty program.
 *
 * Contains customer activity statistics and tier information.
 */
export interface CustomerData {
  /** Public key of the customer account */
  publicKey: string;
  /** Customer's wallet address */
  wallet: string;
  /** Current loyalty tier (Bronze, Silver, Gold, Platinum) */
  tier: string;
  /** Total loyalty tokens earned by this customer */
  totalEarned: number;
  /** Total loyalty tokens redeemed by this customer */
  totalRedeemed: number;
  /** Number of transactions this customer has made */
  transactionCount: number;
  /** Unix timestamp when customer registered */
  registeredAt: number;
  /** Unix timestamp of customer's last activity */
  lastActivity: number;
}

/**
 * Custom hook to fetch all customers for a merchant's loyalty program.
 *
 * This hook queries the blockchain for all customer accounts associated with
 * the merchant's loyalty program. Customers are sorted by total earned tokens
 * (highest first). The hook automatically refetches data every minute to keep
 * customer information up to date.
 *
 * @param merchantPubkey - Public key of the merchant (currently unused, uses wallet)
 * @returns {UseQueryResult<CustomerData[]>} React Query result containing customer data
 *
 * @example
 * ```tsx
 * const { data: customers, isLoading } = useMerchantCustomers(merchantPubkey);
 *
 * if (isLoading) return <div>Loading customers...</div>;
 *
 * return (
 *   <div>
 *     {customers?.map(customer => (
 *       <CustomerRow key={customer.publicKey} customer={customer} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMerchantCustomers(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();

  return useQuery({
    queryKey: ["merchantCustomers", merchantAuthority?.toString()],
    queryFn: async () => {
      if (!program || !merchantAuthority) {
        return [];
      }

      try {
        // Get loyalty program PDA
        const [loyaltyProgram] = getLoyaltyProgramPDA(merchantAuthority);
        const [merchant] = getMerchantPDA(merchantAuthority, loyaltyProgram);

        // Fetch merchant account to get the actual loyalty program
        const merchantAccount = await program.account.merchant.fetch(merchant);
        const actualLoyaltyProgram = merchantAccount.loyaltyProgram;

        // Fetch all customer accounts for this loyalty program
        // We use getProgramAccounts with a filter for the loyalty program
        const customerAccounts = await program.account.customer.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + wallet pubkey (32)
              bytes: actualLoyaltyProgram.toBase58(),
            },
          },
        ]);

        const customers: CustomerData[] = customerAccounts.map((account) => {
          const customer = account.account;

          // Extract tier name
          let tierName = "Bronze";
          if (customer.tier) {
            const tierKeys = Object.keys(customer.tier);
            if (tierKeys.length > 0) {
              tierName =
                tierKeys[0].charAt(0).toUpperCase() + tierKeys[0].slice(1);
            }
          }

          return {
            publicKey: account.publicKey.toString(),
            wallet: customer.wallet.toString(),
            tier: tierName,
            totalEarned: Number(customer.totalEarned),
            totalRedeemed: Number(customer.totalRedeemed),
            transactionCount: Number(customer.transactionCount),
            registeredAt: Number(customer.joinedAt), // Use joinedAt field
            lastActivity: Number(customer.lastActivity),
          };
        });

        return customers.sort((a, b) => b.totalEarned - a.totalEarned);
      } catch (error) {
        return [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
    gcTime: Infinity,
  });
}
