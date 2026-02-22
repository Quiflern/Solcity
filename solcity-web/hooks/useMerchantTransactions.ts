"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { PublicKey } from "@solana/web3.js";

interface Transaction {
  signature: string;
  timestamp: number;
  customerWallet: string;
  amount: number;
  type: "issue" | "redeem";
}

export function useMerchantTransactions(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  const { data, isLoading, error } = useQuery({
    queryKey: ["merchantTransactions", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch transaction signatures for the merchant account
        const signatures = await connection.getSignaturesForAddress(
          merchantPubkey,
          { limit: 50 }
        );

        const transactions: Transaction[] = [];

        // Parse each transaction to extract reward issuance data
        for (const sig of signatures) {
          try {
            const tx = await connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || !tx.meta.logMessages) continue;

            // Look for "Issued" log messages from our program
            const issuedLog = tx.meta.logMessages.find((log) =>
              log.includes("Issued") && log.includes("tokens")
            );

            if (issuedLog) {
              // Parse the log message to extract token amount
              // Example: "Issued 130 tokens (purchase: $100, tier: Bronze, multiplier: 1x, fee: 100 lamports)"
              const match = issuedLog.match(/Issued (\d+) tokens/);
              const amount = match ? parseInt(match[1]) : 0;

              transactions.push({
                signature: sig.signature,
                timestamp: sig.blockTime || Date.now() / 1000,
                customerWallet: "Unknown", // We'd need to parse accounts to get this
                amount,
                type: "issue",
              });
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    transactions: data || [],
    isLoading,
    error,
  };
}
