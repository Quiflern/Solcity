"use client";

import {
  type ActivityType,
  useRecentActivity,
} from "@/hooks/program/useRecentActivity";
import { getExplorerUrl } from "@/lib/explorer";

/**
 * ActivitySection Component
 *
 * Displays real-time activity from the Solcity protocol on the landing page.
 * Shows recent transactions including merchant registrations, rewards issued,
 * redemptions, and tier upgrades.
 *
 * Features:
 * - Real blockchain data from program events
 * - Grid of activity cards with live updates
 * - Hover effects with animated gradient sweep
 * - Links to Solana explorer for transaction details
 * - Auto-refreshes every 30 seconds
 * - Fallback to example data when no real activity
 */
export default function ActivitySection() {
  const { activities, isLoading } = useRecentActivity(8);

  // Fallback example activities when no real data
  const exampleActivities = [
    {
      id: "example-1",
      type: "rewards_issued" as ActivityType,
      title: "Rewards Earned",
      description: "150 tokens earned",
      timestamp: Date.now() / 1000,
      signature: "",
    },
    {
      id: "example-2",
      type: "rewards_redeemed" as ActivityType,
      title: "Reward Redeemed",
      description: "Free Coffee • 200 tokens",
      timestamp: Date.now() / 1000,
      signature: "",
    },
    {
      id: "example-3",
      type: "customer_registered" as ActivityType,
      title: "New Customer Registered",
      description: "Joined loyalty program",
      timestamp: Date.now() / 1000,
      signature: "",
    },
    {
      id: "example-4",
      type: "merchant_registered" as ActivityType,
      title: "New Merchant Joined",
      description: "Coffee Shop",
      timestamp: Date.now() / 1000,
      signature: "",
    },
  ];

  const displayActivities =
    activities.length > 0 ? activities.slice(0, 4) : exampleActivities;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "rewards_issued":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        );
      case "rewards_redeemed":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="4" y="4" width="6" height="6" />
            <rect x="14" y="14" width="6" height="6" />
          </svg>
        );
      case "customer_registered":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7V12" />
          </svg>
        );
      case "merchant_registered":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
          </svg>
        );
      case "tier_upgrade":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 4L4 8L12 12L20 8L12 4Z" />
            <path d="M4 12L12 16L20 12" />
          </svg>
        );
      case "offer_created":
        return (
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 17L17 7" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="7" r="2" />
          </svg>
        );
    }
  };

  return (
    <section className="py-20 bg-bg-primary border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-medium tracking-tight">
            Recent Activity
          </h3>
          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="text-xs text-text-secondary">Loading...</span>
            )}
            <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#d0ff14] animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {displayActivities.map((activity) => {
            const ActivityCard = activity.signature ? "a" : "div";
            const cardProps = activity.signature
              ? {
                  href: getExplorerUrl("tx", activity.signature),
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {};

            return (
              <ActivityCard
                key={activity.id}
                {...cardProps}
                className="bg-panel border border-border p-8 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:bg-[#1a1a1a] hover:border-accent"
              >
                <div className="w-10 h-10 border border-border flex items-center justify-center transition-all duration-300">
                  <div className="w-[18px] stroke-accent">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div>
                  <h4 className="text-[0.95rem] font-medium mb-1">
                    {activity.title}
                  </h4>
                  <p className="text-[0.8rem] text-text-secondary">
                    {activity.description}
                  </p>
                </div>
              </ActivityCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
