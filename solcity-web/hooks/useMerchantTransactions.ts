"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { PublicKey } from "@solana/web3.js";

interface Transaction {
  signature: string;
  timestamp: number;
  customerWallet: string;
  amount: number;
  type: "issue" | "redeem";
}

const TRANSACTIONS_PER_PAGE = 10;

export function useMerchantTransactions(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  const query = useInfiniteQuery({
    queryKey: ["merchantTransactions", merchantPubkey?.toString()],
    queryFn: async ({ pageParam = undefined }) => {
      if (!program || !merchantPubkey) {
        return { transactions: [], hasMore: false, lastSignature: undefined };
      }

      try {
        // Fetch transaction signatures for the merchant account
        const signatures = await connection.getSignaturesForAddress(
          merchantPubkey,
          {
            limit: TRANSACTIONS_PER_PAGE,
            before: pageParam, // For pagination
          }
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
              const match = issuedLog.match(/Issued (\d+) tokens/);
              const amount = match ? parseInt(match[1]) : 0;

              // Try to extract customer wallet from accounts
              let customerWallet = "Unknown";
              if (tx.transaction.message.accountKeys.length > 3) {
                // Customer is typically the 4th account (index 3)
                customerWallet = tx.transaction.message.accountKeys[3]?.pubkey?.toString() || "Unknown";
              }

              transactions.push({
                signature: sig.signature,
                timestamp: sig.blockTime || Date.now() / 1000,
                customerWallet,
                amount,
                type: "issue",
              });
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        const hasMore = signatures.length === TRANSACTIONS_PER_PAGE;
        const lastSignature = signatures.length > 0 ? signatures[signatures.length - 1].signature : undefined;

        return {
          transactions,
          hasMore,
          lastSignature,
        };
      } catch (err) {
        console.error("Error fetching transactions:", err);
        return { transactions: [], hasMore: false, lastSignature: undefined };
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastSignature : undefined;
    },
    enabled: !!program && !!merchantPubkey,
    refetchInterval: 30000, // Refetch every 30 seconds
    initialPageParam: undefined,
  });

  // Flatten all pages into a single array
  const allTransactions = query.data?.pages.flatMap(page => page.transactions) || [];

  return {
    transactions: allTransactions,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}
