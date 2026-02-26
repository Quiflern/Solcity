import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Represents a loyalty transaction (earning or redeeming tokens).
 */
export interface Transaction {
  signature: string;
  timestamp: number;
  type: "earned" | "redeemed";
  merchant: string;
  merchantPubkey: string;
  amount: number;
  tier: string;
}

/**
 * Custom hook to fetch transaction history for the connected customer.
 * 
 * NOTE: This is an expensive operation that parses blockchain logs.
 * Reduced to 50 transactions for faster loading.
 */
export function useTransactionHistory(options?: { enabled?: boolean }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useQuery({
    queryKey: ["transactionHistory", wallet.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        return [];
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      const transactions: Transaction[] = [];

      try {
        // Fetch signatures for customer's wallet (much faster than all program txs)
        const signatures = await connection.getSignaturesForAddress(
          wallet.publicKey,
          { limit: 50 },
        );

        // Cache merchant accounts to avoid duplicate fetches
        const merchantCache = new Map<string, { name: string }>();

        for (const sig of signatures) {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta) continue;

            const logs = tx.meta.logMessages || [];

            // Check if this is a loyalty program transaction
            const isLoyaltyTx = logs.some(log =>
              log.includes(program.programId.toString())
            );

            if (!isLoyaltyTx) continue;

            // Parse reward issuance events
            const rewardLog = logs.find(
              (log) => log.includes("Issued") && log.includes("tokens"),
            );
            if (rewardLog) {
              const match = rewardLog.match(/Issued (\d+) tokens/);
              if (match) {
                const amount = Number.parseInt(match[1], 10);
                const tierMatch = rewardLog.match(/tier: (\w+)/);
                const tier = tierMatch ? tierMatch[1] : "Bronze";

                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  const accountKeys = tx.transaction.message.staticAccountKeys || [];

                  for (const key of accountKeys) {
                    const keyStr = key.toString();

                    if (merchantCache.has(keyStr)) {
                      merchantName = merchantCache.get(keyStr)!.name;
                      merchantPubkey = keyStr;
                      break;
                    }

                    try {
                      const merchantAccount = await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = keyStr;
                      merchantCache.set(keyStr, { name: merchantName });
                      break;
                    } catch {
                      // Not a merchant account
                    }
                  }
                } catch (e) {
                  console.debug("Error fetching merchant:", e);
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
              }
            }

            // Parse redemption events
            const redeemLog = logs.find(
              (log) => log.includes("Redeemed") && log.includes("tokens"),
            );
            if (redeemLog) {
              const match = redeemLog.match(/Redeemed (\d+) tokens/);
              if (match) {
                const amount = Number.parseInt(match[1], 10);

                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  const accountKeys = tx.transaction.message.staticAccountKeys || [];

                  for (const key of accountKeys) {
                    const keyStr = key.toString();

                    if (merchantCache.has(keyStr)) {
                      merchantName = merchantCache.get(keyStr)!.name;
                      merchantPubkey = keyStr;
                      break;
                    }

                    try {
                      const merchantAccount = await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = keyStr;
                      merchantCache.set(keyStr, { name: merchantName });
                      break;
                    } catch {
                      // Not a merchant account
                    }
                  }
                } catch (e) {
                  console.debug("Error fetching merchant:", e);
                }

                transactions.push({
                  signature: sig.signature,
                  timestamp: sig.blockTime || Date.now() / 1000,
                  type: "redeemed",
                  merchant: merchantName,
                  merchantPubkey,
                  amount,
                  tier: "Bronze",
                });
              }
            }
          } catch (err) {
            console.debug("Error parsing transaction:", err);
          }
        }

        return transactions.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
      }
    },
    enabled: options?.enabled !== false && !!wallet.publicKey,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
  });
}
