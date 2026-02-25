"use client";

import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a redemption event where a customer redeemed loyalty points.
 *
 * Redemption events are parsed from blockchain transaction logs to track
 * when customers use their loyalty points for rewards.
 */
export interface RedemptionEvent {
  /** Transaction signature (unique identifier) */
  signature: string;
  /** Unix timestamp when the redemption occurred */
  timestamp: number;
  /** Public key of the customer who redeemed */
  customerWallet: string;
  /** Amount of loyalty tokens redeemed */
  amount: number;
  /** Name of the offer that was redeemed */
  offerName: string;
  /** Type of redemption (e.g., "Discount", "Product") */
  redemptionType: string;
  /** Unique redemption code for validation */
  redemptionCode: string;
}

/**
 * Custom hook to fetch all redemption events for a merchant.
 *
 * This hook retrieves blockchain transactions for the merchant's wallet and
 * parses the transaction logs to identify redemption events. It extracts
 * information about when customers redeemed their loyalty points.
 *
 * The hook automatically refetches data every 30 seconds and caches results
 * indefinitely to prevent data loss during refetches.
 *
 * @param _merchantPubkey - Public key of the merchant (currently unused, uses wallet)
 * @returns {UseQueryResult<RedemptionEvent[]>} React Query result containing redemption events
 *
 * @example
 * ```tsx
 * const { data: redemptions, isLoading } = useMerchantRedemptions(merchantPubkey);
 *
 * if (isLoading) return <div>Loading redemptions...</div>;
 *
 * return (
 *   <div>
 *     {redemptions?.map(redemption => (
 *       <RedemptionRow key={redemption.signature} redemption={redemption} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMerchantRedemptions(_merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["merchantRedemptions", merchantAuthority?.toString()],
    queryFn: async () => {
      if (!program || !merchantAuthority) {
        return [];
      }

      try {
        // Reduced to 10 to avoid rate limiting on public RPC
        const signatures = await connection.getSignaturesForAddress(
          merchantAuthority,
          {
            limit: 10,
          },
        );

        const events: RedemptionEvent[] = [];
        const eventParser = new EventParser(
          program.programId,
          new BorshCoder(program.idl),
        );

        for (const sig of signatures) {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || tx.meta.err) continue;

            const parsedEvents = Array.from(
              eventParser.parseLogs(tx.meta.logMessages || []),
            );

            for (const event of parsedEvents) {
              if (event.name === "RewardsRedeemedEvent") {
                const data = event.data as any;

                // Extract redemption type
                let redemptionType = "Unknown";
                if (data.redemptionType) {
                  const typeKeys = Object.keys(data.redemptionType);
                  if (typeKeys.length > 0) {
                    redemptionType =
                      typeKeys[0].charAt(0).toUpperCase() +
                      typeKeys[0].slice(1);
                  }
                }

                events.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  customerWallet: data.customerWallet.toString(),
                  amount: data.amount.toNumber(),
                  offerName: data.offerName || "Unknown Offer",
                  redemptionType,
                  redemptionCode: data.redemptionCode || "",
                });
              }
            }
          } catch (err) {
            // Silently skip failed transactions
          }
        }

        return events.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        const existingData = queryClient.getQueryData([
          "merchantRedemptions",
          merchantAuthority?.toString(),
        ]);
        return existingData || [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    retry: false, // Disable retries on rate limit errors
    staleTime: Infinity, // Never consider data stale
    refetchInterval: false, // Disable auto-refetch
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
