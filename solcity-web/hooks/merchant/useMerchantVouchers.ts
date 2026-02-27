"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a voucher issued to a customer
 */
export interface MerchantVoucher {
  /** Public key of the voucher account */
  publicKey: string;
  /** Customer wallet address */
  customer: string;
  /** Merchant public key */
  merchant: string;
  /** Redemption offer public key */
  redemptionOffer: string;
  /** Merchant name */
  merchantName: string;
  /** Offer name */
  offerName: string;
  /** Offer description */
  offerDescription: string;
  /** Cost in SLCY tokens */
  cost: number;
  /** Unique redemption code (SLCY-XXXX-XXXX) */
  redemptionCode: string;
  /** Unix timestamp when voucher was created */
  createdAt: number;
  /** Unix timestamp when voucher expires */
  expiresAt: number;
  /** Whether voucher has been used */
  isUsed: boolean;
  /** Unix timestamp when voucher was used (if used) */
  usedAt: number | null;
}

/**
 * Custom hook to fetch all vouchers for a merchant.
 * 
 * Fetches all RedemptionVoucher accounts where the merchant matches.
 * Useful for merchant dashboard to see all customer vouchers.
 *
 * @param merchantPubkey - Public key of the merchant
 * @returns React Query result containing merchant vouchers
 */
export function useMerchantVouchers(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["merchantVouchers", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all RedemptionVoucher accounts for this merchant
        const vouchers = await program.account.redemptionVoucher.all([
          {
            memcmp: {
              offset: 8 + 32, // Skip discriminator (8) + customer pubkey (32)
              bytes: merchantPubkey.toBase58(),
            },
          },
        ]);

        const merchantVouchers: MerchantVoucher[] = vouchers.map((voucher) => {
          const data = voucher.account;

          return {
            publicKey: voucher.publicKey.toString(),
            customer: data.customer.toString(),
            merchant: data.merchant.toString(),
            redemptionOffer: data.redemptionOffer.toString(),
            merchantName: data.merchantName,
            offerName: data.offerName,
            offerDescription: data.offerDescription,
            cost: Number(data.cost.toString()),
            redemptionCode: data.redemptionCode,
            createdAt: Number(data.createdAt.toString()),
            expiresAt: Number(data.expiresAt.toString()),
            isUsed: data.isUsed,
            usedAt: data.usedAt ? Number(data.usedAt.toString()) : null,
          };
        });

        // Sort by created date (most recent first)
        return merchantVouchers.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error("Error fetching merchant vouchers:", error);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
