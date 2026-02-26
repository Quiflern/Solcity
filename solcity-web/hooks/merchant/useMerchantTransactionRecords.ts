"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a transaction record from the blockchain.
 */
export interface TransactionRecord {
  /** Public key of the record account */
  publicKey: string;
  /** Customer wallet address */
  customer: string;
  /** Merchant public key */
  merchant: string;
  /** Transaction type: "issue" or "redeem" */
  transactionType: "issue" | "redeem";
  /** Amount of tokens */
  amount: number;
  /** Unix timestamp */
  timestamp: number;
  /** Customer tier at time of transaction */
  tier?: string;
  /** Transaction index */
  index: number;
}

/**
 * Custom hook to fetch transaction records for a merchant.
 * 
 * Fetches from on-chain TransactionRecord accounts for fast, reliable data.
 * Much faster and more reliable than parsing transaction logs.
 *
 * @param merchantPubkey - Public key of the merchant
 * @returns React Query result containing transaction records
 */
export function useMerchantTransactionRecords(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["merchantTransactionRecords", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all TransactionRecord accounts for this merchant
        const transactionRecords = await program.account.transactionRecord.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + customer pubkey (32)
              bytes: merchantPubkey.toBase58(),
            },
          },
        ]);

        const transactions: TransactionRecord[] = transactionRecords.map((record) => {
          const data = record.account;

          // Determine transaction type from the data
          // transactionType: 0 = Issue/Earned, 1 = Redeemed
          const transactionType = data.transactionType === 0 ? "issue" : "redeem";

          // Map tier number to string
          const tierMap: { [key: number]: string } = {
            0: "bronze",
            1: "silver",
            2: "gold",
            3: "platinum",
          };

          return {
            publicKey: record.publicKey.toString(),
            customer: data.customer.toString(),
            merchant: data.merchant.toString(),
            transactionType,
            amount: Number(data.amount.toString()),
            timestamp: Number(data.timestamp.toString()),
            tier: tierMap[data.tier],
            index: Number(data.index.toString()),
          };
        });

        // Sort by timestamp (most recent first)
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching merchant transaction records:", error);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    retry: 1,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
