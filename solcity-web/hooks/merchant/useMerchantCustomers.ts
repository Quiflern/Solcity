"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { PublicKey } from "@solana/web3.js";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

export interface CustomerData {
  publicKey: string;
  wallet: string;
  tier: string;
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
  registeredAt: number;
  lastActivity: number;
}

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
        console.log("=== Fetching Merchant Customers ===");

        // Get loyalty program PDA
        const [loyaltyProgram] = getLoyaltyProgramPDA(merchantAuthority);
        const [merchant] = getMerchantPDA(merchantAuthority, loyaltyProgram);

        // Fetch merchant account to get the actual loyalty program
        const merchantAccount = await program.account.merchant.fetch(merchant);
        const actualLoyaltyProgram = merchantAccount.loyaltyProgram;

        console.log("Loyalty program:", actualLoyaltyProgram.toString());

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

        console.log(`Found ${customerAccounts.length} customers`);

        const customers: CustomerData[] = customerAccounts.map((account) => {
          const customer = account.account;

          // Extract tier name
          let tierName = "Bronze";
          if (customer.tier) {
            const tierKeys = Object.keys(customer.tier);
            if (tierKeys.length > 0) {
              tierName = tierKeys[0].charAt(0).toUpperCase() + tierKeys[0].slice(1);
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
        console.error("Error fetching customers:", error);
        return [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
    gcTime: Infinity,
  });
}
