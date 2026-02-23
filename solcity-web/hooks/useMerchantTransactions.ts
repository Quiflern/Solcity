"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
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

const TRANSACTIONS_PER_PAGE = 10;

export function useMerchantTransactions(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey } = useWallet(); // Get the merchant authority wallet

  const query = useInfiniteQuery({
    queryKey: ["merchantTransactions", merchantPubkey?.toString()],
    queryFn: async ({ pageParam = undefined }) => {
      if (!program || !merchantPubkey || !publicKey) {
        return { transactions: [], hasMore: false, lastSignature: undefined };
      }

      try {
        // Fetch transaction signatures for the MERCHANT AUTHORITY (wallet), not the PDA
        const signatures = await connection.getSignaturesForAddress(
          publicKey, // Use the wallet address, not merchant PDA
          {
            limit: TRANSACTIONS_PER_PAGE,
            before: pageParam, // For pagination
          }
        );

        console.log(`Fetched ${signatures.length} signatures for merchant authority`);

        const transactions: Transaction[] = [];

        // Parse each transaction to extract reward issuance data
        for (const sig of signatures) {
          try {
            const tx = await connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || !tx.meta.logMessages) {
              console.log(`Skipping tx ${sig.signature.slice(0, 8)}: no logs`);
              continue;
            }

            console.log(`Parsing tx ${sig.signature.slice(0, 8)}, logs:`, tx.meta.logMessages);

            // Check if this transaction involves our program and the issueRewards instruction
            const programInvoked = tx.meta.logMessages.some(log =>
              log.includes(program.programId.toString()) && log.includes("invoke")
            );

            const isIssueRewards = tx.meta.logMessages.some(log =>
              log.includes("Instruction: IssueRewards")
            );

            if (!programInvoked || !isIssueRewards) {
              continue;
            }

            console.log(`Found issueRewards tx ${sig.signature.slice(0, 8)}`);

            // Look for "Issued" log messages from our program
            const issuedLog = tx.meta.logMessages.find((log) =>
              log.includes("Issued") && log.includes("tokens")
            );

            if (issuedLog) {
              console.log(`Found issued log: ${issuedLog}`);

              // Parse the log message to extract token amount
              const match = issuedLog.match(/Issued (\d+) tokens/);
              const amount = match ? parseInt(match[1]) : 0;

              // Try to extract customer wallet from accounts
              let customerWallet = "Unknown";
              if (tx.transaction.message.accountKeys.length > 3) {
                // Customer is typically the 4th account (index 3)
                customerWallet = tx.transaction.message.accountKeys[3]?.pubkey?.toString() || "Unknown";
              }

              console.log(`Adding transaction: amount=${amount}, customer=${customerWallet.slice(0, 8)}`);

              transactions.push({
                signature: sig.signature,
                timestamp: sig.blockTime || Date.now() / 1000,
                customerWallet,
                amount,
                type: "issue",
              });
            } else {
              console.log(`No issued log found in tx ${sig.signature.slice(0, 8)}`);
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        console.log(`Parsed ${transactions.length} transactions from ${signatures.length} signatures`);

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
    enabled: !!program && !!merchantPubkey && !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    gcTime: 60000, // Keep unused data in cache for 1 minute
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
