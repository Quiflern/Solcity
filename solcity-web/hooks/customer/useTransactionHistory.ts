import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getProgram } from "@/lib/anchor/setup";

export interface Transaction {
  signature: string;
  timestamp: number;
  type: "earned" | "redeemed";
  merchant: string;
  merchantPubkey: string;
  amount: number;
  tier: string;
}

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
        console.log("Fetching transaction history for:", wallet.publicKey.toString());

        // Fetch all program transactions for this wallet
        const signatures = await connection.getSignaturesForAddress(
          wallet.publicKey,
          { limit: 100 }
        );

        console.log(`Found ${signatures.length} total signatures for wallet`);

        for (const sig of signatures) {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta) continue;

            // Parse transaction logs to identify reward/redemption events
            const logs = tx.meta.logMessages || [];

            // Log relevant messages for debugging
            const relevantLogs = logs.filter(log =>
              log.includes("Issued") ||
              log.includes("Redeemed") ||
              log.includes("Instruction:") ||
              log.includes("Program log:")
            );

            if (relevantLogs.length > 0) {
              console.log(`Transaction ${sig.signature.slice(0, 8)} relevant logs:`, relevantLogs);
            }

            // Check for reward issuance - look for the detailed log message
            const rewardLog = logs.find(log => log.includes("Issued") && log.includes("tokens"));
            if (rewardLog) {
              console.log("✅ Found reward issuance:", rewardLog);
              // Extract amount from log: "Issued X tokens (purchase: $Y, tier: Z, ...)"
              const match = rewardLog.match(/Issued (\d+) tokens/);
              if (match) {
                const amount = parseInt(match[1]);

                // Try to extract tier from the log
                const tierMatch = rewardLog.match(/tier: (\w+)/);
                const tier = tierMatch ? tierMatch[1] : "Bronze";

                // Try to get merchant name from account keys
                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  // Look through all account keys to find merchant account
                  const accountKeys = tx.transaction.message.staticAccountKeys || [];
                  console.log(`Checking ${accountKeys.length} account keys for merchant`);

                  for (const key of accountKeys) {
                    try {
                      const merchantAccount = await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = key.toString();
                      console.log(`Found merchant: ${merchantName}`);
                      break;
                    } catch (e) {
                      // Not a merchant account, continue
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

                console.log(`Added earned transaction: ${amount} SLCY from ${merchantName}`);
              }
            }

            // Check for redemption - look for the log message
            const redeemLog = logs.find(log => log.includes("Redeemed") && log.includes("tokens"));
            if (redeemLog) {
              console.log("✅ Found redemption:", redeemLog);
              const match = redeemLog.match(/Redeemed (\d+) tokens/);
              if (match) {
                const amount = parseInt(match[1]);

                // Try to get merchant name from account keys
                let merchantName = "Unknown Merchant";
                let merchantPubkey = "";

                try {
                  // Look through all account keys to find merchant account
                  const accountKeys = tx.transaction.message.staticAccountKeys || [];
                  console.log(`Checking ${accountKeys.length} account keys for merchant`);

                  for (const key of accountKeys) {
                    try {
                      const merchantAccount = await program.account.merchant.fetch(key);
                      merchantName = merchantAccount.name;
                      merchantPubkey = key.toString();
                      console.log(`Found merchant: ${merchantName}`);
                      break;
                    } catch (e) {
                      // Not a merchant account, continue
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

                console.log(`Added redeemed transaction: ${amount} SLCY at ${merchantName}`);
              }
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        console.log(`Parsed ${transactions.length} reward/redemption transactions`);
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
