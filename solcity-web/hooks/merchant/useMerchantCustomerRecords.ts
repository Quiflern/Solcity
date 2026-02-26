"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a merchant-customer relationship record with analytics.
 */
export interface MerchantCustomerRecord {
  /** Public key of the record account */
  publicKey: string;
  /** Merchant public key */
  merchant: string;
  /** Customer wallet address */
  customer: string;
  /** Total tokens issued to this customer */
  totalIssued: number;
  /** Total tokens redeemed by this customer */
  totalRedeemed: number;
  /** Number of transactions (earn + redeem) */
  transactionCount: number;
  /** Unix timestamp of first transaction */
  firstTransaction: number;
  /** Unix timestamp of last transaction */
  lastTransaction: number;
}

/**
 * Custom hook to fetch merchant-customer relationship records.
 * 
 * These records provide fast analytics about customer activity with a specific merchant.
 * Each record tracks the relationship between one merchant and one customer.
 *
 * @param merchantPubkey - Public key of the merchant
 * @returns React Query result containing merchant customer records
 */
export function useMerchantCustomerRecords(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();

  return useQuery({
    queryKey: ["merchantCustomerRecords", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all MerchantCustomerRecord accounts for this merchant
        const records = await program.account.merchantCustomerRecord.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: merchantPubkey.toBase58(),
            },
          },
        ]);

        const customerRecords: MerchantCustomerRecord[] = records.map((record) => {
          const data = record.account;

          return {
            publicKey: record.publicKey.toString(),
            merchant: data.merchant.toString(),
            customer: data.customer.toString(),
            totalIssued: Number(data.totalIssued.toString()),
            totalRedeemed: Number(data.totalRedeemed.toString()),
            transactionCount: Number(data.transactionCount.toString()),
            firstTransaction: Number(data.firstTransaction.toString()),
            lastTransaction: Number(data.lastTransaction.toString()),
          };
        });

        // Sort by total issued (most active customers first)
        return customerRecords.sort((a, b) => b.totalIssued - a.totalIssued);
      } catch (error) {
        console.error("Error fetching merchant customer records:", error);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
