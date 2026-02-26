"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents an offer redemption record for analytics.
 */
export interface OfferRedemptionRecord {
  /** Public key of the record account */
  publicKey: string;
  /** Redemption offer public key */
  offer: string;
  /** Merchant public key */
  merchant: string;
  /** Customer wallet address */
  customer: string;
  /** Voucher public key */
  voucher: string;
  /** Amount of tokens spent */
  amount: number;
  /** Unix timestamp of redemption */
  timestamp: number;
  /** Whether voucher has been used */
  isUsed: boolean;
  /** Unix timestamp when voucher was used (if applicable) */
  usedAt: number | null;
}

/**
 * Custom hook to fetch offer redemption records for a merchant.
 * 
 * These records track individual redemptions of offers, allowing merchants
 * to see who redeemed what and when.
 *
 * @param merchantPubkey - Public key of the merchant
 * @returns React Query result containing offer redemption records
 */
export function useOfferRedemptionRecords(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["offerRedemptionRecords", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all OfferRedemptionRecord accounts for this merchant
        const records = await program.account.offerRedemptionRecord.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + offer pubkey (32)
              bytes: merchantPubkey.toBase58(),
            },
          },
        ]);

        const redemptionRecords: OfferRedemptionRecord[] = records.map((record) => {
          const data = record.account;

          return {
            publicKey: record.publicKey.toString(),
            offer: data.offer.toString(),
            merchant: data.merchant.toString(),
            customer: data.customer.toString(),
            voucher: data.voucher.toString(),
            amount: Number(data.amount.toString()),
            timestamp: Number(data.timestamp.toString()),
            isUsed: data.isUsed,
            usedAt: data.usedAt ? Number(data.usedAt.toString()) : null,
          };
        });

        // Sort by timestamp (most recent first)
        return redemptionRecords.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching offer redemption records:", error);
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
