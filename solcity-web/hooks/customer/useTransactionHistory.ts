import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";
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
 * Fetches from on-chain TransactionRecord accounts for fast, reliable data.
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

      try {
        // Fetch all TransactionRecord accounts for this customer
        const transactionRecords = await program.account.transactionRecord.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);

        // Cache merchant accounts to avoid duplicate fetches
        const merchantCache = new Map<string, { name: string }>();

        const transactions: Transaction[] = await Promise.all(
          transactionRecords.map(async (record) => {
            const data = record.account;

            // Get merchant name
            let merchantName = "Unknown Merchant";
            const merchantKey = data.merchant.toString();

            if (merchantCache.has(merchantKey)) {
              merchantName = merchantCache.get(merchantKey)!.name;
            } else {
              try {
                const merchantAccount = await program.account.merchant.fetch(
                  data.merchant
                );
                merchantName = merchantAccount.name;
                merchantCache.set(merchantKey, { name: merchantName });
              } catch (e) {
                console.debug("Error fetching merchant:", e);
              }
            }

            // Convert tier number to string
            const tierNames = ["Bronze", "Silver", "Gold", "Platinum"];
            const tierName = tierNames[data.tier] || "Bronze";

            // Convert BN to number
            const amount = typeof data.amount === "number"
              ? data.amount
              : Number(data.amount.toString());

            const timestamp = typeof data.timestamp === "number"
              ? data.timestamp
              : Number(data.timestamp.toString());

            return {
              signature: record.publicKey.toString(), // Use PDA as signature
              timestamp,
              type: data.transactionType === 0 ? "earned" : "redeemed",
              merchant: merchantName,
              merchantPubkey: merchantKey,
              amount,
              tier: tierName,
            } as Transaction;
          })
        );

        // Sort by timestamp descending (newest first)
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
      }
    },
    enabled: options?.enabled !== false && !!wallet.publicKey,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
  });
}
