"use client";

import type { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import {
  type CustomerData,
  useMerchantCustomers,
} from "./useMerchantCustomers";
import {
  type IssuanceEvent,
  type RedemptionEvent,
  useMerchantEvents,
} from "./useMerchantEvents";

/**
 * Key performance metrics for merchant analytics.
 */
export interface AnalyticsMetrics {
  /** Average reward tokens issued per transaction */
  avgRewardPerTx: number;
  /** Percentage of issued tokens that have been redeemed */
  redemptionRate: number;
  /** Percentage of customers who made multiple purchases */
  retentionRate: number;
  /** Number of new customers in the selected period */
  newCustomers: number;
  /** Total number of customers */
  totalCustomers: number;
}

/**
 * Time series data point for charts.
 */
export interface TimeSeriesData {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Tokens issued on this date */
  issued: number;
  /** Tokens redeemed on this date */
  redeemed: number;
}

/**
 * Distribution of customers across loyalty tiers.
 */
export interface TierDistribution {
  /** Number of Bronze tier customers */
  bronze: number;
  /** Number of Silver tier customers */
  silver: number;
  /** Number of Gold tier customers */
  gold: number;
  /** Number of Platinum tier customers */
  platinum: number;
}

/**
 * Breakdown of redemptions by offer type.
 */
export interface RedemptionBreakdown {
  /** Name of the redemption offer */
  offerName: string;
  /** Number of times this offer was redeemed */
  count: number;
  /** Percentage of total redemptions */
  percentage: number;
}

/**
 * Extended customer data with calculated metrics.
 */
interface TopCustomer extends CustomerData {
  /** Total tokens earned (calculated from events) */
  earned: number;
  /** Total tokens redeemed (calculated from events) */
  redeemed: number;
  /** Unix timestamp of last activity */
  lastActivity: number;
}

/**
 * Custom hook to calculate comprehensive analytics for a merchant.
 *
 * This hook aggregates data from issuance events, redemptions, and customer
 * accounts to provide actionable insights including:
 * - Key performance metrics (avg reward, redemption rate, retention)
 * - Time series data for charts
 * - Customer tier distribution
 * - Top redemption offers
 * - Top customers by earned tokens
 *
 * All metrics are calculated based on the selected date range.
 *
 * @param merchantPubkey - Public key of the merchant (currently unused)
 * @param dateRange - Time period for analytics ("7d", "30d", "90d", "custom")
 * @returns Comprehensive analytics data and loading state
 *
 * @example
 * ```tsx
 * const { metrics, timeSeriesData, topCustomers, isLoading } =
 *   useMerchantAnalytics(merchantPubkey, "30d");
 *
 * if (isLoading) return <div>Loading analytics...</div>;
 *
 * return (
 *   <div>
 *     <MetricsCards metrics={metrics} />
 *     <Chart data={timeSeriesData} />
 *     <TopCustomersTable customers={topCustomers} />
 *   </div>
 * );
 * ```
 */
export function useMerchantAnalytics(
  merchantPubkey: PublicKey | null,
  dateRange: "7d" | "30d" | "90d" | "custom" = "30d",
) {
  const { data: eventsData, isLoading: eventsLoading, isFetching: eventsFetching, dataUpdatedAt, refetch } = useMerchantEvents(merchantPubkey);
  const issuanceEvents: IssuanceEvent[] = eventsData?.issuances ?? [];
  const redemptions: RedemptionEvent[] = eventsData?.redemptions ?? [];

  const { data: customersData, isLoading: customersLoading } =
    useMerchantCustomers(merchantPubkey);
  const customers: CustomerData[] =
    (customersData as CustomerData[] | undefined) ?? [];

  const isLoading = eventsLoading || customersLoading;
  const isFetching = eventsFetching;

  // Filter data by date range
  const filteredData = useMemo((): {
    issuanceEvents: IssuanceEvent[];
    redemptions: RedemptionEvent[];
    customers: CustomerData[];
  } => {
    const now = Date.now() / 1000;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, custom: 365 };
    const days = daysMap[dateRange];
    const cutoffTime = now - days * 24 * 60 * 60;

    return {
      issuanceEvents: issuanceEvents.filter(
        (e: IssuanceEvent) => e.timestamp >= cutoffTime,
      ),
      redemptions: redemptions.filter(
        (r: RedemptionEvent) => r.timestamp >= cutoffTime,
      ),
      customers: customers,
    };
  }, [issuanceEvents, redemptions, customers, dateRange]);

  // Calculate key metrics
  const metrics = useMemo((): AnalyticsMetrics => {
    const {
      issuanceEvents: filteredIssuance,
      redemptions: filteredRedemptions,
      customers: filteredCustomers,
    } = filteredData;

    // Average reward per transaction
    const totalIssued = filteredIssuance.reduce(
      (sum: number, e: IssuanceEvent) => sum + e.amount,
      0,
    );
    const avgRewardPerTx =
      filteredIssuance.length > 0 ? totalIssued / filteredIssuance.length : 0;

    // Redemption rate (redeemed / issued)
    const totalRedeemed = filteredRedemptions.reduce(
      (sum: number, r: RedemptionEvent) => sum + r.amount,
      0,
    );
    const redemptionRate =
      totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;

    // Retention rate (customers with multiple transactions)
    const customerTxCount = new Map<string, number>();
    filteredIssuance.forEach((e: IssuanceEvent) => {
      const count = customerTxCount.get(e.customerWallet) || 0;
      customerTxCount.set(e.customerWallet, count + 1);
    });
    const returningCustomers = Array.from(customerTxCount.values()).filter(
      (count: number) => count > 1,
    ).length;
    const retentionRate =
      customerTxCount.size > 0
        ? (returningCustomers / customerTxCount.size) * 100
        : 0;

    // New customers in this period
    const now = Date.now() / 1000;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, custom: 365 };
    const days = daysMap[dateRange];
    const cutoffTime = now - days * 24 * 60 * 60;
    const newCustomers = filteredCustomers.filter(
      (c: CustomerData) => c.registeredAt >= cutoffTime,
    ).length;

    return {
      avgRewardPerTx,
      redemptionRate,
      retentionRate,
      newCustomers,
      totalCustomers: filteredCustomers.length,
    };
  }, [filteredData, dateRange]);

  // Time series data for chart
  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    const {
      issuanceEvents: filteredIssuance,
      redemptions: filteredRedemptions,
    } = filteredData;

    if (filteredIssuance.length === 0 && filteredRedemptions.length === 0) {
      return [];
    }

    const dataMap = new Map<string, { issued: number; redeemed: number }>();

    // Group issuance by date
    for (const event of filteredIssuance) {
      const date = new Date(event.timestamp * 1000).toISOString().split("T")[0];
      const existing = dataMap.get(date) || { issued: 0, redeemed: 0 };
      existing.issued += event.amount;
      dataMap.set(date, existing);
    }

    // Group redemptions by date
    for (const redemption of filteredRedemptions) {
      const date = new Date(redemption.timestamp * 1000)
        .toISOString()
        .split("T")[0];
      const existing = dataMap.get(date) || { issued: 0, redeemed: 0 };
      existing.redeemed += redemption.amount;
      dataMap.set(date, existing);
    }

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Tier distribution
  const tierDistribution = useMemo((): TierDistribution => {
    const distribution = { bronze: 0, silver: 0, gold: 0, platinum: 0 };

    customers.forEach((customer: CustomerData) => {
      const tier = customer.tier.toLowerCase();
      if (tier in distribution) {
        distribution[tier as keyof TierDistribution]++;
      }
    });

    return distribution;
  }, [customers]);

  // Redemption breakdown by offer
  const redemptionBreakdown = useMemo((): RedemptionBreakdown[] => {
    const { redemptions: filteredRedemptions } = filteredData;

    if (filteredRedemptions.length === 0) {
      return [];
    }

    const offerCounts = new Map<string, number>();

    for (const r of filteredRedemptions) {
      offerCounts.set(r.offerName, (offerCounts.get(r.offerName) || 0) + 1);
    }

    const total = filteredRedemptions.length;
    return Array.from(offerCounts.entries())
      .map(([offerName, count]) => ({
        offerName,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [filteredData]);

  // Top customers by earned tokens
  const topCustomers = useMemo((): TopCustomer[] => {
    if (customers.length === 0) {
      return [];
    }

    // Build lookup maps for faster access
    const customerEarnings = new Map<string, number>();
    const customerRedemptions = new Map<string, number>();
    const customerLastActivity = new Map<string, number>();

    for (const event of issuanceEvents) {
      const current = customerEarnings.get(event.customerWallet) || 0;
      customerEarnings.set(event.customerWallet, current + event.amount);

      const lastActivity = customerLastActivity.get(event.customerWallet) || 0;
      if (event.timestamp > lastActivity) {
        customerLastActivity.set(event.customerWallet, event.timestamp);
      }
    }

    for (const redemption of redemptions) {
      const current = customerRedemptions.get(redemption.customerWallet) || 0;
      customerRedemptions.set(redemption.customerWallet, current + redemption.amount);

      const lastActivity = customerLastActivity.get(redemption.customerWallet) || 0;
      if (redemption.timestamp > lastActivity) {
        customerLastActivity.set(redemption.customerWallet, redemption.timestamp);
      }
    }

    return customers
      .map((customer: CustomerData): TopCustomer => {
        const earnedFromEvents = customerEarnings.get(customer.wallet) || 0;
        const redeemedFromEvents = customerRedemptions.get(customer.wallet) || 0;
        const lastActivityFromEvents = customerLastActivity.get(customer.wallet) || 0;

        // Use on-chain lastActivity if available, otherwise fall back to events
        const lastActivity = customer.lastActivity > 0
          ? customer.lastActivity
          : lastActivityFromEvents;

        return {
          ...customer,
          earned: earnedFromEvents,
          redeemed: redeemedFromEvents,
          lastActivity,
        };
      })
      .sort((a: TopCustomer, b: TopCustomer) => b.totalEarned - a.totalEarned)
      .slice(0, 10); // Top 10
  }, [customers, issuanceEvents, redemptions]);

  return {
    isLoading,
    isFetching,
    metrics,
    timeSeriesData,
    tierDistribution,
    redemptionBreakdown,
    topCustomers,
    dataUpdatedAt,
    refetch,
  };
}
