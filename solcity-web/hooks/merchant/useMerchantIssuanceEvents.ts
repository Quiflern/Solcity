"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { PublicKey } from "@solana/web3.js";
import { BorshCoder, EventParser } from "@coral-xyz/anchor";

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

export function useMerchantIssuanceEvents(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey: merchantAuthority } = useWallet();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["merchantIssuanceEvents", merchantAuthority?.toString()],
    queryFn: async () => {
      if (!program || !merchantAuthority) {
        return [];
      }

      try {
        console.log("=== Fetching Issuance Events ===");
        console.log("Merchant wallet address:", merchantAuthority.toString());
        console.log("Program ID:", program.programId.toString());
        console.log("RPC endpoint:", connection.rpcEndpoint);

        // Fetch transaction signatures from the merchant's wallet
        const signatures = await connection.getSignaturesForAddress(merchantAuthority, {
          limit: 100,
        });

        console.log(`Found ${signatures.length} signatures for merchant wallet`);

        if (signatures.length === 0) {
          console.warn("No signatures found. Possible reasons:");
          console.warn("1. No transactions have been made from this wallet");
          console.warn("2. Test ledger was cleared after transactions");
          console.warn("3. Wrong wallet address being queried");
          console.warn("4. RPC endpoint issue");

          // Try to get recent blockhash to verify connection
          try {
            const recentBlockhash = await connection.getLatestBlockhash();
            console.log("Connection is working. Latest blockhash:", recentBlockhash.blockhash);
          } catch (e) {
            console.error("Connection test failed:", e);
          }

          return [];
        }

        console.log("Sample signatures:", signatures.slice(0, 3).map(s => ({
          signature: s.signature.slice(0, 20) + "...",
          slot: s.slot,
          blockTime: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : "unknown"
        })));

        const events: IssuanceEvent[] = [];
        const eventParser = new EventParser(program.programId, new BorshCoder(program.idl));

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
              console.warn(`Transaction ${sig.signature.slice(0, 20)}... not found`);
              continue;
            }

            if (!tx.meta) {
              console.warn(`Transaction ${sig.signature.slice(0, 20)}... has no metadata`);
              continue;
            }

            // Check if transaction was successful
            if (tx.meta.err) {
              console.log(`Transaction ${sig.signature.slice(0, 20)}... failed:`, tx.meta.err);
              continue;
            }

            // Check if this transaction involves our program
            const involvesSolcityProgram = tx.transaction.message.getAccountKeys().staticAccountKeys
              .some(key => key.equals(program.programId));

            if (!involvesSolcityProgram) {
              console.log(`Transaction ${sig.signature.slice(0, 20)}... doesn't involve Solcity program`);
              continue;
            }

            console.log(`Processing transaction ${sig.signature.slice(0, 20)}...`);
            console.log("Log messages:", tx.meta.logMessages?.length || 0);

            // Parse events from transaction logs using Anchor's event parser
            // parseLogs returns a generator, so convert to array
            const parsedEvents = Array.from(eventParser.parseLogs(tx.meta.logMessages || []));

            console.log(`Found ${parsedEvents.length} events in transaction`);

            for (const event of parsedEvents) {
              console.log("Event name:", event.name);

              // Check if this is a RewardsIssuedEvent
              if (event.name === "RewardsIssuedEvent") {
                eventsFoundCount++;
                const data = event.data as any;

                console.log("RewardsIssuedEvent data:", {
                  finalReward: data.finalReward?.toString(),
                  customerWallet: data.customerWallet?.toString(),
                  purchaseAmount: data.purchaseAmount?.toString(),
                  tierMultiplier: data.tierMultiplier?.toString(),
                  ruleMultiplier: data.ruleMultiplier?.toString(),
                  ruleApplied: data.ruleApplied,
                });

                // Extract tier name from the tier enum
                let tierName = "Bronze";
                if (data.customerTier) {
                  const tierKeys = Object.keys(data.customerTier);
                  if (tierKeys.length > 0) {
                    tierName = tierKeys[0].charAt(0).toUpperCase() + tierKeys[0].slice(1);
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

                console.log(`✓ Added event: ${data.finalReward.toNumber()} SLCY to ${data.customerWallet.toString().slice(0, 8)}...`);
              }
            }
          } catch (err) {
            errorCount++;
            console.error(`Error parsing transaction ${sig.signature.slice(0, 20)}...:`, err);
          }
        }

        console.log("=== Processing Summary ===");
        console.log(`Processed: ${processedCount}/${signatures.length} transactions`);
        console.log(`Errors: ${errorCount}`);
        console.log(`RewardsIssuedEvents found: ${eventsFoundCount}`);
        console.log(`Final events array length: ${events.length}`);

        return events.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching issuance events:", error);
        // Return existing data instead of empty array to prevent data loss
        const existingData = queryClient.getQueryData(["merchantIssuanceEvents", merchantAuthority?.toString()]);
        return existingData || [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    gcTime: Infinity, // Never garbage collect - keep data forever
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}
