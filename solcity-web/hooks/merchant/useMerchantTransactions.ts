"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Represents a loyalty transaction.
 */
interface Transaction {
  /** Transaction signature (unique identifier) */
  signature: string;
  /** Unix timestamp when the transaction occurred */
  timestamp: number;
  /** Public key of the customer involved */
  customerWallet: string;
  /** Amount of loyalty tokens */
  amount: number;
  /** Type of transaction */
  type: "issue" | "redeem";
}

const TRANSACTIONS_PER_PAGE = 10;

/**
 * Custom hook to fetch paginated transaction history for a merchant.
 *
 * This hook uses infinite query to load transactions in pages, allowing
 * for efficient loading of large transaction histories. It parses blockchain
 * transactions to extract reward issuance events.
 *
 * The hook automatically refetches data every 30 seconds to stay up to date.
 *
 * @param _merchantPubkey - Public key of the merchant (currently unused, uses wallet)
 * @returns {Object} Transaction data and pagination controls
 * @returns {Transaction[]} transactions - Flattened array of all loaded transactions
 * @returns {boolean} isLoading - Whether initial data is loading
 * @returns {Error|null} error - Any error that occurred
 * @returns {boolean} hasMore - Whether more pages are available
 * @returns {Function} loadMore - Function to load the next page
 * @returns {boolean} isLoadingMore - Whether next page is loading
 *
 * @example
 * ```tsx
 * const { transactions, isLoading, hasMore, loadMore, isLoadingMore } =
 *   useMerchantTransactions(merchantPubkey);
 *
 * if (isLoading) return <div>Loading...</div>;
 *
 * return (
 *   <div>
 *     {transactions.map(tx => (
 *       <TransactionRow key={tx.signature} transaction={tx} />
 *     ))}
 *     {hasMore && (
 *       <button onClick={() => loadMore()} disabled={isLoadingMore}>
 *         {isLoadingMore ? 'Loading...' : 'Load More'}
 *       </button>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useMerchantTransactions(_merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();
  const { publicKey } = useWallet(); // Get the merchant authority wallet

  const query = useInfiniteQuery({
    queryKey: ["merchantTransactions", _merchantPubkey?.toString()],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!program || !_merchantPubkey || !publicKey) {
        return { transactions: [], hasMore: false, lastSignature: undefined };
      }

      try {
        // Fetch transaction signatures for the MERCHANT AUTHORITY (wallet), not the PDA
        const signatures = await connection.getSignaturesForAddress(
          publicKey, // Use the wallet address, not merchant PDA
          {
            limit: TRANSACTIONS_PER_PAGE,
            before: pageParam, // For pagination
          },
        );

        const transactions: Transaction[] = [];

        // Parse each transaction to extract reward issuance data
        for (const sig of signatures) {
          try {
            const tx = await connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || !tx.meta.logMessages) {
              continue;
            }

            // Check if this transaction involves our program and the issueRewards instruction
            const programInvoked = tx.meta.logMessages.some(
              (log) =>
                log.includes(program.programId.toString()) &&
                log.includes("invoke"),
            );

            const isIssueRewards = tx.meta.logMessages.some((log) =>
              log.includes("Instruction: IssueRewards"),
            );

            if (!programInvoked || !isIssueRewards) {
              continue;
            }

            // Look for "Issued" log messages from our program
            const issuedLog = tx.meta.logMessages.find(
              (log) => log.includes("Issued") && log.includes("tokens"),
            );

            if (issuedLog) {
              // Parse the log message to extract token amount
              const match = issuedLog.match(/Issued (\d+) tokens/);
              const amount = match ? parseInt(match[1]) : 0;

              // Try to extract customer wallet from accounts
              let customerWallet = "Unknown";
              if (tx.transaction.message.accountKeys.length > 3) {
                // Customer is typically the 4th account (index 3)
                customerWallet =
                  tx.transaction.message.accountKeys[3]?.pubkey?.toString() ||
                  "Unknown";
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
            // Silently skip failed transactions
          }
        }

        const hasMore = signatures.length === TRANSACTIONS_PER_PAGE;
        const lastSignature =
          signatures.length > 0
            ? signatures[signatures.length - 1].signature
            : undefined;

        return {
          transactions,
          hasMore,
          lastSignature,
        };
      } catch (err) {
        return { transactions: [], hasMore: false, lastSignature: undefined };
      }
    },
    getNextPageParam: (lastPage: {
      transactions: Transaction[];
      hasMore: boolean;
      lastSignature: string | undefined;
    }) => {
      return lastPage.hasMore ? lastPage.lastSignature : undefined;
    },
    enabled: !!program && !!_merchantPubkey && !!publicKey,
    retry: false, // Disable retries on rate limit errors
    refetchInterval: false, // Disable auto-refetch
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Keep data forever
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    initialPageParam: undefined,
  });

  // Flatten all pages into a single array
  const allTransactions =
    query.data?.pages.flatMap((page) => page.transactions) || [];

  return {
    transactions: allTransactions,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}
