"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PROGRAM_ID } from "@/lib/anchor/setup";
import { PublicKey } from "@solana/web3.js";

/**
 * Activity types that can be displayed on the landing page
 */
export type ActivityType =
  | "merchant_registered"
  | "customer_registered"
  | "rewards_issued"
  | "rewards_redeemed"
  | "tier_upgrade"
  | "offer_created";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
  signature: string;
}

/**
 * Custom hook to fetch recent activity from the Solcity protocol.
 *
 * This hook listens to program events and parses them into displayable
 * activity items for the landing page. It fetches the most recent
 * transaction signatures and parses their event logs.
 *
 * @param limit - Maximum number of activities to fetch (default: 8)
 * @returns Recent activity data and query state
 */
export function useRecentActivity(limit = 8) {
  const { connection } = useConnection();

  const { data, isLoading, error } = useQuery({
    queryKey: ["recentActivity", limit],
    queryFn: async () => {
      try {
        // Fetch recent transaction signatures for the program
        const signatures = await connection.getSignaturesForAddress(
          PROGRAM_ID,
          { limit },
        );

        const activities: Activity[] = [];

        // Parse each transaction to extract event data
        for (const sigInfo of signatures) {
          try {
            const tx = await connection.getTransaction(sigInfo.signature, {
              maxSupportedTransactionVersion: 0,
            });

            if (!tx?.meta?.logMessages) continue;

            // Parse event logs
            const activity = parseActivityFromLogs(
              tx.meta.logMessages,
              sigInfo.signature,
              sigInfo.blockTime || Date.now() / 1000,
            );

            if (activity) {
              activities.push(activity);
            }
          } catch (err) {
            console.error("Error parsing transaction:", err);
          }
        }

        return activities;
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    activities: data || [],
    isLoading,
    error,
  };
}

/**
 * Parse activity from transaction logs
 */
function parseActivityFromLogs(
  logs: string[],
  signature: string,
  timestamp: number,
): Activity | null {
  // Look for program event logs
  for (const log of logs) {
    // Merchant registered
    if (log.includes("MerchantRegisteredEvent")) {
      const match = log.match(/"name":"([^"]+)"/);
      const name = match ? match[1] : "New Merchant";
      return {
        id: signature,
        type: "merchant_registered",
        title: "New Merchant Joined",
        description: name,
        timestamp,
        signature,
      };
    }

    // Customer registered
    if (log.includes("CustomerRegisteredEvent")) {
      return {
        id: signature,
        type: "customer_registered",
        title: "New Customer Registered",
        description: "Joined loyalty program",
        timestamp,
        signature,
      };
    }

    // Rewards issued
    if (log.includes("RewardsIssuedEvent")) {
      const amountMatch = log.match(/"final_reward":(\d+)/);
      const amount = amountMatch ? Number.parseInt(amountMatch[1]) : 0;
      return {
        id: signature,
        type: "rewards_issued",
        title: "Rewards Earned",
        description: `${amount} tokens earned`,
        timestamp,
        signature,
      };
    }

    // Rewards redeemed
    if (log.includes("RewardsRedeemedEvent")) {
      const offerMatch = log.match(/"offer_name":"([^"]+)"/);
      const amountMatch = log.match(/"amount":(\d+)/);
      const offer = offerMatch ? offerMatch[1] : "Reward";
      const amount = amountMatch ? Number.parseInt(amountMatch[1]) : 0;
      return {
        id: signature,
        type: "rewards_redeemed",
        title: "Reward Redeemed",
        description: `${offer} • ${amount} tokens`,
        timestamp,
        signature,
      };
    }

    // Tier upgrade
    if (log.includes("TierUpgradeEvent")) {
      const tierMatch = log.match(/"new_tier":"([^"]+)"/);
      const tier = tierMatch ? tierMatch[1] : "Higher";
      return {
        id: signature,
        type: "tier_upgrade",
        title: "Tier Upgraded",
        description: `Reached ${tier} tier`,
        timestamp,
        signature,
      };
    }

    // Offer created
    if (log.includes("RedemptionOfferEvent") && log.includes('"action":"created"')) {
      const nameMatch = log.match(/"name":"([^"]+)"/);
      const name = nameMatch ? nameMatch[1] : "New Offer";
      return {
        id: signature,
        type: "offer_created",
        title: "New Offer Available",
        description: name,
        timestamp,
        signature,
      };
    }
  }

  return null;
}
