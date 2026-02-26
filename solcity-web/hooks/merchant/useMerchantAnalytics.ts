"use client";

import type { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useMerchantCustomers, type CustomerData } from "./useMerchantCustomers";
import { useMerchantCustomerRecords } from "./useMerchantCustomerRecords";
import { useMerchantTransactionRecords } from "./useMerchantTransactionRecords";

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
 * This hook uses FAST on-chain record accounts instead of slow event parsing:
 * - MerchantCustomerRecords for aggregated customer stats
 * - TransactionRecords for individual transactions
 * - Customer accounts for tier distribution
 *
 * All metrics are calculated based on the selected date range.
 *
 * @param merchantPubkey - Public key of the merchant PDA
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
  // Use FAST record-based hooks instead of slow event parsing
  const { data: customerRecords = [], isLoading: recordsLoading, refetch: refetchRecords } =
    useMerchantCustomerRecords(merchantPubkey);
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } =
    useMerchantTransactionRecords(merchantPubkey);
  const { data: customersData, isLoading: customersLoading } =
    useMerchantCustomers(merchantPubkey);
  const customers: CustomerData[] =
    (customersData as CustomerData[] | undefined) ?? [];

  const isLoading = recordsLoading || transactionsLoading || customersLoading;
  const isFetching = false; // Records are always fresh
  const dataUpdatedAt = Date.now();

  const refetch = async () => {
    await Promise.all([refetchRecords(), refetchTransactions()]);
  };

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = Date.now() / 1000;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, custom: 365 };
    const days = daysMap[dateRange];
    const cutoffTime = now - days * 24 * 60 * 60;

    return transactions.filter(tx => tx.timestamp >= cutoffTime);
  }, [transactions, dateRange]);

  // Calculate key metrics
  const metrics = useMemo((): AnalyticsMetrics => {
    const issuedTxs = filteredTransactions.filter(tx => tx.transactionType === "issue");
    const redeemedTxs = filteredTransactions.filter(tx => tx.transactionType === "redeem");

    // Average reward per transaction
    const totalIssued = issuedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const avgRewardPerTx = issuedTxs.length > 0 ? totalIssued / issuedTxs.length : 0;

    // Redemption rate (redeemed / issued)
    const totalRedeemed = redeemedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const redemptionRate = totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;

    // Retention rate (customers with multiple transactions)
    const customerTxCount = new Map<string, number>();
    issuedTxs.forEach(tx => {
      const count = customerTxCount.get(tx.customer) || 0;
      customerTxCount.set(tx.customer, count + 1);
    });
    const returningCustomers = Array.from(customerTxCount.values()).filter(
      count => count > 1,
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
    const newCustomers = customerRecords.filter(
      record => record.firstTransaction >= cutoffTime,
    ).length;

    return {
      avgRewardPerTx,
      redemptionRate,
      retentionRate,
      newCustomers,
      totalCustomers: customerRecords.length,
    };
  }, [filteredTransactions, customerRecords, dateRange]);

  // Time series data for chart
  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    if (filteredTransactions.length === 0) {
      return [];
    }

    const dataMap = new Map<string, { issued: number; redeemed: number }>();

    // Group transactions by date
    for (const tx of filteredTransactions) {
      const date = new Date(tx.timestamp * 1000).toISOString().split("T")[0];
      const existing = dataMap.get(date) || { issued: 0, redeemed: 0 };

      if (tx.transactionType === "issue") {
        existing.issued += tx.amount;
      } else {
        existing.redeemed += tx.amount;
      }

      dataMap.set(date, existing);
    }

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

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

  // Redemption breakdown - simplified since TransactionRecord doesn't store offer names
  const redemptionBreakdown = useMemo((): RedemptionBreakdown[] => {
    const redeemedTxs = filteredTransactions.filter(tx => tx.transactionType === "redeem");

    if (redeemedTxs.length === 0) {
      return [];
    }

    // Group by tier since we don't have offer names in TransactionRecord
    const tierCounts = new Map<string, number>();

    for (const tx of redeemedTxs) {
      const tierName = tx.tier || "unknown";
      tierCounts.set(tierName, (tierCounts.get(tierName) || 0) + 1);
    }

    const total = redeemedTxs.length;
    return Array.from(tierCounts.entries())
      .map(([offerName, count]) => ({
        offerName: `${offerName.charAt(0).toUpperCase()}${offerName.slice(1)} Tier Redemptions`,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTransactions]);

  // Top customers by earned tokens
  const topCustomers = useMemo((): TopCustomer[] => {
    if (customers.length === 0 || customerRecords.length === 0) {
      return [];
    }

    // Create a map of customer records for quick lookup
    const recordMap = new Map(
      customerRecords.map(record => [record.customer, record])
    );

    return customers
      .map((customer: CustomerData): TopCustomer => {
        const record = recordMap.get(customer.wallet);

        return {
          ...customer,
          earned: record?.totalIssued || 0,
          redeemed: record?.totalRedeemed || 0,
          lastActivity: record?.lastTransaction || customer.lastActivity || 0,
        };
      })
      .filter(c => c.earned > 0) // Only show customers with activity
      .sort((a: TopCustomer, b: TopCustomer) => b.earned - a.earned)
      .slice(0, 10); // Top 10
  }, [customers, customerRecords]);

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
