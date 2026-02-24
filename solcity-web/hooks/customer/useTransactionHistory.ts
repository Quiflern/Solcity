import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Represents a loyalty transaction (earning or redeeming tokens).
 *
 * Transactions are parsed from blockchain transaction logs to provide
 * a history of customer loyalty activity.
 */
export interface Transaction {
  /** Transaction signature (unique identifier) */
  signature: string;
  /** Unix timestamp when the transaction occurred */
  timestamp: number;
  /** Type of transaction - earning tokens or redeeming them */
  type: "earned" | "redeemed";
  /** Name of the merchant involved in the transaction */
  merchant: string;
  /** Public key of the merchant account */
  merchantPubkey: string;
  /** Amount of loyalty tokens earned or redeemed */
  amount: number;
  /** Customer tier at the time of transaction */
  tier: string;
}

/**
 * Custom hook to fetch and parse transaction history for the connected customer.
 *
 * This hook retrieves all blockchain transactions for the connected wallet and
 * parses the transaction logs to identify loyalty-related events (earning and
 * redeeming tokens). It extracts relevant information like amounts, merchants,
 * and tiers from the program logs.
 *
 * The parsing logic looks for specific log messages:
 * - "Issued X tokens" for earning transactions
 * - "Redeemed X tokens" for redemption transactions
 *
 * @returns {UseQueryResult<Transaction[]>} React Query result containing:
 * - data: Array of transaction objects sorted by timestamp (newest first)
 * - isLoading: Whether the query is currently loading
 * - error: Any error that occurred during the query
 * - refetch: Function to manually refetch transaction history
 *
 * @example
 * ```tsx
 * const { data: transactions, isLoading } = useTransactionHistory();
 *
 * if (isLoading) return <div>Loading history...</div>;
 *
 * return (
 *   <div>
 *     {transactions?.map(tx => (
 *       <div key={tx.signature}>
 *         {tx.type === 'earned' ? '+' : '-'}{tx.amount} SLCY
 *         at {tx.merchant}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useTransactionHistory() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useQuery({
    queryKey: ["transactionHistory", wallet.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        console.log("Transaction history: Wallet not connected");
        return [];
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      const transactions: Transaction[] = [];

      try {
        console.log(
          "Fetching transaction history for:",
          wallet.publicKey.toString(),
        );

        // Fetch recent transaction signatures for this wallet (last 100)
        const signatures = await connection.getSignaturesForAddress(
          wallet.publicKey,
          { limit: 100 },
        );

        console.log(`Found ${signatures.length} total signatures for wallet`);

        // Parse each transaction to extract loyalty events
        for (const sig of signatures) {
          try {
            // Fetch full transaction details including logs
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta) continue;

            // Extract program logs from transaction metadata
            const logs = tx.meta.logMessages || [];

            // Filter for relevant loyalty program logs (for debugging)
            const relevantLogs = logs.filter(
              (log) =>
                log.includes("Issued") ||
                log.includes("Redeemed") ||
                log.includes("Instruction:") ||
                log.includes("Program log:"),
            );

            if (relevantLogs.length > 0) {
              console.log(
                `Transaction ${sig.signature.slice(0, 8)} relevant logs:`,
                relevantLogs,
              );
            }

            // Parse reward issuance events
            // Look for log message: "Issued X tokens (purchase: $Y, tier: Z, ...)"
            const rewardLog = logs.find(
              (log) => log.includes("Issued") && log.includes("tokens"),
            );
            if (rewardLog) {
              console.log("✅ Found reward issuance:", rewardLog);
              // Extract token amount from log message
              const match = rewardLog.match(/Issued (\d+) tokens/);
              if (match) {
                const amount = Number.parseInt(match[1], 10);

                // Extract customer tier from log message
                const tierMatch = rewardLog.match(/tier: (\w+)/);
                const tier = tierMatch ? tierMatch[1] : "Bronze";

                // Attempt to identify merchant from transaction account keys
                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  // Iterate through transaction accounts to find merchant account
                  const accountKeys =
                    tx.transaction.message.staticAccountKeys || [];
                  console.log(
                    `Checking ${accountKeys.length} account keys for merchant`,
                  );

                  for (const key of accountKeys) {
                    try {
                      // Try to fetch as merchant account
                      const merchantAccount =
                        await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = key.toString();
                      console.log(`Found merchant: ${merchantName}`);
                      break;
                    } catch {
                      // Not a merchant account, continue searching
                    }
                  }
                } catch (e) {
                  console.error("Error fetching merchant:", e);
                }

                transactions.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  type: "earned",
                  merchant: merchantName,
                  merchantPubkey,
                  amount,
                  tier,
                });

                console.log(
                  `Added earned transaction: ${amount} SLCY from ${merchantName}`,
                );
              }
            }

            // Parse redemption events
            // Look for log message: "Redeemed X tokens for offer Y"
            const redeemLog = logs.find(
              (log) => log.includes("Redeemed") && log.includes("tokens"),
            );
            if (redeemLog) {
              console.log("✅ Found redemption:", redeemLog);
              // Extract token amount from log message
              const match = redeemLog.match(/Redeemed (\d+) tokens/);
              if (match) {
                const amount = Number.parseInt(match[1], 10);

                // Attempt to identify merchant from transaction account keys
                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  // Iterate through transaction accounts to find merchant account
                  const accountKeys =
                    tx.transaction.message.staticAccountKeys || [];
                  console.log(
                    `Checking ${accountKeys.length} account keys for merchant`,
                  );

                  for (const key of accountKeys) {
                    try {
                      // Try to fetch as merchant account
                      const merchantAccount =
                        await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = key.toString();
                      console.log(`Found merchant: ${merchantName}`);
                      break;
                    } catch {
                      // Not a merchant account, continue searching
                    }
                  }
                } catch (e) {
                  console.error("Error fetching merchant:", e);
                }

                transactions.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  type: "redeemed",
                  merchant: merchantName,
                  merchantPubkey,
                  amount,
                  tier: "Bronze", // Tier at time of redemption
                });

                console.log(
                  `Added redeemed transaction: ${amount} SLCY at ${merchantName}`,
                );
              }
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        console.log(
          `Parsed ${transactions.length} reward/redemption transactions`,
        );
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
      }
    },
    enabled: !!wallet.publicKey,
    staleTime: 30000, // 30 seconds
  });
}
