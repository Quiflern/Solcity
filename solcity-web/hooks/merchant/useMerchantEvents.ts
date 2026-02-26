"use client";

import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
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

export interface RedemptionEvent {
  signature: string;
  timestamp: number;
  customerWallet: string;
  amount: number;
  offerName: string;
  redemptionType: string;
  redemptionCode: string;
}

interface MerchantEvents {
  issuances: IssuanceEvent[];
  redemptions: RedemptionEvent[];
}

/**
 * Unified hook to fetch all merchant events (issuances and redemptions).
 * 
 * This hook fetches program transactions and parses events in a single pass,
 * which is more efficient than separate hooks. It uses proper pagination
 * and rate limiting to avoid API issues.
 */
export function useMerchantEvents(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();

  return useQuery({
    queryKey: ["merchantEvents", merchantPubkey?.toString()],
    queryFn: async (): Promise<MerchantEvents> => {
      if (!program || !merchantPubkey || !merchantAuthority) {
        return { issuances: [], redemptions: [] };
      }

      try {
        // Use the merchantPubkey passed in (which is already the PDA)
        const issuances: IssuanceEvent[] = [];
        const redemptions: RedemptionEvent[] = [];
        const eventParser = new EventParser(
          program.programId,
          new BorshCoder(program.idl),
        );

        // Fetch signatures for the MERCHANT account, not the entire program
        // This is much more efficient - only gets transactions involving this merchant
        let allSignatures: any[] = [];
        let lastSignature: string | undefined = undefined;
        const BATCH_SIZE = 50; // Can be larger now since we're filtering by merchant
        const MAX_BATCHES = 10; // Fetch up to 500 merchant transactions

        console.log("🔍 Fetching transactions for merchant account:", merchantPubkey.toString());

        for (let batch = 0; batch < MAX_BATCHES; batch++) {
          try {
            // Add delay BEFORE each request (except first)
            if (batch > 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Fetch signatures for the MERCHANT PDA, not the program
            const signatures = await connection.getSignaturesForAddress(
              merchantPubkey, // Changed from program.programId to merchantPubkey
              {
                limit: BATCH_SIZE,
                before: lastSignature,
              }
            );

            if (signatures.length === 0) break;

            allSignatures = allSignatures.concat(signatures);
            lastSignature = signatures[signatures.length - 1].signature;

            console.log(`  Batch ${batch + 1}: Fetched ${signatures.length} signatures`);

            if (signatures.length < BATCH_SIZE) break;
          } catch (err: any) {
            console.warn(`⚠️ Failed to fetch signature batch ${batch}:`, err?.message || err);
            // If we hit rate limit, wait longer and try to continue with what we have
            if (err?.message?.includes('429') || err?.message?.includes('rate')) {
              console.log("  Rate limit hit, stopping signature fetch");
            }
            break;
          }
        }

        // Process transactions with rate limiting
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        let processedCount = 0;
        let relevantCount = 0;
        let errorCount = 0;

        console.log(`📦 Processing ${allSignatures.length} total signatures...`);

        for (const sig of allSignatures) {
          try {
            // Add delay every 3 transactions (less aggressive since we have fewer txs)
            if (processedCount > 0 && processedCount % 3 === 0) {
              await delay(200);
            }

            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta) continue;

            // Skip failed transactions
            if (tx.meta.err) {
              errorCount++;
              continue;
            }

            // All transactions already involve our merchant (we fetched by merchant PDA)
            relevantCount++;

            // Parse all events from this transaction
            const parsedEvents = Array.from(
              eventParser.parseLogs(tx.meta.logMessages || []),
            );

            for (const event of parsedEvents) {
              // Process issuance events (note: event names are camelCase from parser)
              if (event.name === "rewardsIssuedEvent") {
                const data = event.data as any;

                // Validate required fields
                if (!data.merchant || !data.customerWallet || !data.finalReward) {
                  console.warn("Invalid rewardsIssuedEvent data, skipping");
                  continue;
                }

                // Check if merchant matches (handle both PublicKey and string)
                const eventMerchant = data.merchant?.toString();
                const expectedMerchant = merchantPubkey.toString();

                if (eventMerchant !== expectedMerchant) {
                  continue;
                }

                let tierName = "Bronze";
                if (data.customerTier) {
                  const tierKeys = Object.keys(data.customerTier);
                  if (tierKeys.length > 0) {
                    tierName = tierKeys[0].charAt(0).toUpperCase() + tierKeys[0].slice(1);
                  }
                }

                issuances.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  customerWallet: data.customerWallet.toString(),
                  amount: data.finalReward.toNumber(),
                  purchaseAmount: data.purchaseAmount?.toNumber() / 100 || 0,
                  tierMultiplier: data.tierMultiplier?.toNumber() / 100 || 1,
                  ruleMultiplier: data.ruleMultiplier?.toNumber() / 100 || 1,
                  ruleApplied: data.ruleApplied || false,
                  ruleName: data.ruleName || undefined,
                  customerTier: tierName,
                });
              }

              // Process redemption events (note: event names are camelCase from parser)
              if (event.name === "rewardsRedeemedEvent") {
                const data = event.data as any;

                // Validate required fields
                if (!data.merchant || !data.customerWallet || !data.amount) {
                  console.warn("Invalid rewardsRedeemedEvent data, skipping");
                  continue;
                }

                // Check if merchant matches (handle both PublicKey and string)
                const eventMerchant = data.merchant?.toString();
                const expectedMerchant = merchantPubkey.toString();

                if (eventMerchant !== expectedMerchant) {
                  continue;
                }

                let redemptionType = "Unknown";
                if (data.redemptionType) {
                  const typeKeys = Object.keys(data.redemptionType);
                  if (typeKeys.length > 0) {
                    redemptionType = typeKeys[0].charAt(0).toUpperCase() + typeKeys[0].slice(1);
                  }
                }

                redemptions.push({
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

            processedCount++;

            // Smart rate limiting: more aggressive delays for more transactions
            if (processedCount % 3 === 0) {
              await delay(150);
            }
          } catch (err: any) {
            errorCount++;
            // Log errors but continue processing
            if (errorCount <= 3) {
              console.warn(`Error processing transaction ${sig.signature.slice(0, 8)}:`, err?.message || err);
            }
            // If we hit rate limit during transaction processing, stop
            if (err?.message?.includes('429') || err?.message?.includes('rate')) {
              console.log("⚠️ Rate limit hit during transaction processing, stopping");
              break;
            }
          }
        }

        console.log("✅ Processing complete:");
        console.log(`  Total signatures: ${allSignatures.length}`);
        console.log(`  Processed: ${processedCount}, Relevant: ${relevantCount}, Errors: ${errorCount}`);
        console.log(`  Found ${issuances.length} issuances, ${redemptions.length} redemptions`);

        return {
          issuances: issuances.sort((a, b) => b.timestamp - a.timestamp),
          redemptions: redemptions.sort((a, b) => b.timestamp - a.timestamp),
        };
      } catch (error) {
        console.error("Error fetching merchant events:", error);
        return { issuances: [], redemptions: [] };
      }
    },
    enabled: !!program && !!merchantPubkey && !!merchantAuthority,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Cache for 5 minutes - data is already on-chain and won't change frequently
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 30 minutes even if unused
    gcTime: 30 * 60 * 1000,
    // Don't refetch on window focus - user can manually refresh if needed
    refetchOnWindowFocus: false,
    // Don't refetch on mount if data is still fresh
    refetchOnMount: false,
    // Don't auto-refetch in background
    refetchInterval: false,
    // Use cached data while revalidating in background
    refetchOnReconnect: true,
  });
}

// Separate hooks for backward compatibility
export function useMerchantIssuanceEvents(merchantPubkey: PublicKey | null) {
  const { data, isLoading, error } = useMerchantEvents(merchantPubkey);
  return {
    data: data?.issuances || [],
    isLoading,
    error,
  };
}

export function useMerchantRedemptions(merchantPubkey: PublicKey | null) {
  const { data, isLoading, error } = useMerchantEvents(merchantPubkey);
  return {
    data: data?.redemptions || [],
    isLoading,
    error,
  };
}
