"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { PublicKey } from "@solana/web3.js";
import { BorshCoder, EventParser } from "@coral-xyz/anchor";

export interface RedemptionEvent {
  signature: string;
  timestamp: number;
  customerWallet: string;
  amount: number;
  offerName: string;
  redemptionType: string;
  redemptionCode: string;
}

export function useMerchantRedemptions(merchantPubkey: PublicKey | null) {
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
        console.log("=== Fetching Redemption Events ===");
        console.log("Merchant wallet:", merchantAuthority.toString());

        const signatures = await connection.getSignaturesForAddress(merchantAuthority, {
          limit: 100,
        });

        console.log(`Found ${signatures.length} signatures`);

        const events: RedemptionEvent[] = [];
        const eventParser = new EventParser(program.programId, new BorshCoder(program.idl));

        for (const sig of signatures) {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || tx.meta.err) continue;

            const parsedEvents = Array.from(eventParser.parseLogs(tx.meta.logMessages || []));

            for (const event of parsedEvents) {
              if (event.name === "RewardsRedeemedEvent") {
                const data = event.data as any;

                // Extract redemption type
                let redemptionType = "Unknown";
                if (data.redemptionType) {
                  const typeKeys = Object.keys(data.redemptionType);
                  if (typeKeys.length > 0) {
                    redemptionType = typeKeys[0].charAt(0).toUpperCase() + typeKeys[0].slice(1);
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
            console.error("Error parsing transaction:", err);
          }
        }

        console.log(`Parsed ${events.length} redemption events`);
        return events.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching redemption events:", error);
        const existingData = queryClient.getQueryData(["merchantRedemptions", merchantAuthority?.toString()]);
        return existingData || [];
      }
    },
    enabled: !!program && !!merchantAuthority,
    staleTime: 30000,
    refetchInterval: 30000,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
