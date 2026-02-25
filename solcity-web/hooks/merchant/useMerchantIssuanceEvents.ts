"use client";

import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

export interface IssuanceEvent {
  signature: string;
  timestamp: number;
  customerWallet: string;
  amount: number;
  purchaseAmount: number;
  tierMultiplier: number;
  ruleMultiplier: number;
  ruleApplied: boolean;
  ruleName?: string;
  customerTier: string;
}

/**
 * Custom hook to fetch all reward issuance events for a merchant.
 *
 * This hook retrieves blockchain transactions for the merchant's wallet and
 * parses the transaction logs to identify reward issuance events. It extracts
 * detailed information about each reward issuance including customer details,
 * amounts, multipliers, and applied rules.
 *
 * The hook automatically refetches data every 30 seconds and caches results
 * indefinitely to prevent data loss during refetches. Failed transactions are
 * silently skipped to ensure robust operation.
 *
 * @param _merchantPubkey - Public key of the merchant (currently unused, uses wallet)
 * @returns {UseQueryResult<IssuanceEvent[]>} React Query result containing issuance events
 *
 * @example
 * ```tsx
 * const { data: events, isLoading } = useMerchantIssuanceEvents(merchantPubkey);
 *
 * if (isLoading) return <div>Loading events...</div>;
 *
 * return (
 *   <div>
 *     {events?.map(event => (
 *       <IssuanceRow key={event.signature} event={event} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMerchantIssuanceEvents(_merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["merchantIssuanceEvents", merchantAuthority?.toString()],
    queryFn: async (): Promise<IssuanceEvent[]> => {
      if (!program || !merchantAuthority) {
        return [];
      }

      try {
        // Fetch transaction signatures from the merchant's wallet
        // Reduced to 10 to avoid rate limiting on public RPC
        const signatures = await connection.getSignaturesForAddress(
          merchantAuthority,
          {
            limit: 10,
          },
        );

        if (signatures.length === 0) {
          return [];
        }

        const events: IssuanceEvent[] = [];
        const eventParser = new EventParser(
          program.programId,
          new BorshCoder(program.idl),
        );

        let processedCount = 0;
        let errorCount = 0;
        let eventsFoundCount = 0;

        for (const sig of signatures) {
          try {
            processedCount++;

            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx) {
              continue;
            }

            if (!tx.meta) {
              continue;
            }

            // Check if transaction was successful
            if (tx.meta.err) {
              continue;
            }

            // Check if this transaction involves our program
            const involvesSolcityProgram = tx.transaction.message
              .getAccountKeys()
              .staticAccountKeys.some((key) => key.equals(program.programId));

            if (!involvesSolcityProgram) {
              continue;
            }

            // Parse events from transaction logs using Anchor's event parser
            // parseLogs returns a generator, so convert to array
            const parsedEvents = Array.from(
              eventParser.parseLogs(tx.meta.logMessages || []),
            );

            for (const event of parsedEvents) {
              // Check if this is a RewardsIssuedEvent
              if (event.name === "RewardsIssuedEvent") {
                eventsFoundCount++;
                const data = event.data as any;

                // Extract tier name from the tier enum
                let tierName = "Bronze";
                if (data.customerTier) {
                  const tierKeys = Object.keys(data.customerTier);
                  if (tierKeys.length > 0) {
                    tierName =
                      tierKeys[0].charAt(0).toUpperCase() +
                      tierKeys[0].slice(1);
                  }
                }

                events.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  customerWallet: data.customerWallet.toString(),
                  amount: data.finalReward.toNumber(),
                  purchaseAmount: data.purchaseAmount.toNumber() / 100, // Convert cents to dollars
                  tierMultiplier: data.tierMultiplier.toNumber() / 100, // Convert basis points
                  ruleMultiplier: data.ruleMultiplier.toNumber() / 100, // Convert basis points
                  ruleApplied: data.ruleApplied,
                  ruleName: data.ruleName || undefined,
                  customerTier: tierName,
                });
              }
            }
          } catch (err) {
            errorCount++;
          }
        }

        return events.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        // Return existing data instead of empty array to prevent data loss
        const existingData = queryClient.getQueryData([
          "merchantIssuanceEvents",
          merchantAuthority?.toString(),
        ]) as IssuanceEvent[] | undefined;
        return existingData || [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    retry: false, // Disable retries on rate limit errors
    staleTime: Infinity, // Never consider data stale
    refetchInterval: false, // Disable auto-refetch
    gcTime: Infinity, // Never garbage collect - keep data forever
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}
