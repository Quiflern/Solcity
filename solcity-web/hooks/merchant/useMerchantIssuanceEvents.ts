"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { PublicKey } from "@solana/web3.js";

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

  return useQuery({
    queryKey: ["merchantIssuanceEvents", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        console.log("Fetching issuance events for merchant:", merchantPubkey.toString());

        // Fetch RewardsIssuedEvent events from the program
        // Events are stored in program logs, we need to parse transaction signatures
        const signatures = await connection.getSignaturesForAddress(merchantPubkey, {
          limit: 100,
        });

        console.log(`Found ${signatures.length} signatures for merchant`);

        const events: IssuanceEvent[] = [];

        for (const sig of signatures) {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || !tx.meta.logMessages) continue;

            const logs = tx.meta.logMessages;

            // Look for RewardsIssuedEvent in logs
            // Anchor events are emitted as "Program data: <base64>" in logs
            const eventLog = logs.find(log =>
              log.includes("Program data:") &&
              logs.some(l => l.includes("Issued") && l.includes("tokens"))
            );

            if (eventLog) {
              // Parse the "Issued X tokens" log for amount
              const issuedLog = logs.find(log => log.includes("Issued") && log.includes("tokens"));

              if (issuedLog) {
                console.log("Found issued log:", issuedLog);

                // Extract data from log message
                // Format: "Issued X tokens (purchase: $Y, tier: Z, tier_mult: Ax, rule_mult: Bx, rule_applied: true/false, fee: C lamports)"
                const amountMatch = issuedLog.match(/Issued (\d+) tokens/);
                const purchaseMatch = issuedLog.match(/purchase: \$([0-9.]+)/);
                const tierMatch = issuedLog.match(/tier: (\w+)/);
                const tierMultMatch = issuedLog.match(/tier_mult: ([0-9.]+)x/);
                const ruleMultMatch = issuedLog.match(/rule_mult: ([0-9.]+)x/);
                const ruleAppliedMatch = issuedLog.match(/rule_applied: (true|false)/);

                if (amountMatch) {
                  const amount = parseInt(amountMatch[1]);
                  const purchaseAmount = purchaseMatch ? parseFloat(purchaseMatch[1]) : 0;
                  const tier = tierMatch ? tierMatch[1] : "Bronze";
                  const tierMult = tierMultMatch ? parseFloat(tierMultMatch[1]) : 1.0;
                  const ruleMult = ruleMultMatch ? parseFloat(ruleMultMatch[1]) : 1.0;
                  const ruleApplied = ruleAppliedMatch ? ruleAppliedMatch[1] === "true" : false;

                  // Try to extract customer wallet from accounts
                  let customerWallet = "Unknown";
                  if (tx.transaction.message.staticAccountKeys && tx.transaction.message.staticAccountKeys.length > 2) {
                    // Customer account is typically one of the accounts
                    customerWallet = tx.transaction.message.staticAccountKeys[2]?.toString() || "Unknown";
                  }

                  events.push({
                    signature: sig.signature,
                    timestamp: sig.blockTime || Date.now() / 1000,
                    customerWallet,
                    amount,
                    purchaseAmount,
                    tierMultiplier: tierMult,
                    ruleMultiplier: ruleMult,
                    ruleApplied,
                    customerTier: tier,
                  });

                  console.log(`Added event: ${amount} SLCY to ${customerWallet.slice(0, 8)}`);
                }
              }
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        console.log(`Parsed ${events.length} issuance events`);
        return events.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching issuance events:", error);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    staleTime: 5000, // 5 seconds - refetch more aggressively
    refetchInterval: 15000, // Refetch every 15 seconds for near real-time updates
  });
}
