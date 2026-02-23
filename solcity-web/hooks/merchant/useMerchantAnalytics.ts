"use client";

import { useMemo } from "react";
import { useMerchantIssuanceEvents } from "./useMerchantIssuanceEvents";
import { useMerchantRedemptions } from "./useMerchantRedemptions";
import { useMerchantCustomers } from "./useMerchantCustomers";
import { PublicKey } from "@solana/web3.js";

export interface AnalyticsMetrics {
  avgRewardPerTx: number;
  redemptionRate: number;
  retentionRate: number;
  newCustomers: number;
  totalCustomers: number;
}

export interface TimeSeriesData {
  date: string;
  issued: number;
  redeemed: number;
}

export interface TierDistribution {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface RedemptionBreakdown {
  offerName: string;
  count: number;
  percentage: number;
}

export function useMerchantAnalytics(
  merchantPubkey: PublicKey | null,
  dateRange: "7d" | "30d" | "90d" | "custom" = "30d"
) {
  const { data: issuanceEvents = [], isLoading: issuanceLoading } = useMerchantIssuanceEvents(merchantPubkey);
  const { data: redemptions = [], isLoading: redemptionsLoading } = useMerchantRedemptions(merchantPubkey);
  const { data: customers = [], isLoading: customersLoading } = useMerchantCustomers(merchantPubkey);

  const isLoading = issuanceLoading || redemptionsLoading || customersLoading;

  // Filter data by date range
  const filteredData = useMemo(() => {
    const now = Date.now() / 1000;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, "custom": 365 };
    const days = daysMap[dateRange];
    const cutoffTime = now - days * 24 * 60 * 60;

    return {
      issuanceEvents: issuanceEvents.filter((e) => e.timestamp >= cutoffTime),
      redemptions: redemptions.filter((r) => r.timestamp >= cutoffTime),
      customers: customers,
    };
  }, [issuanceEvents, redemptions, customers, dateRange]);

  // Calculate key metrics
  const metrics = useMemo((): AnalyticsMetrics => {
    const { issuanceEvents, redemptions, customers } = filteredData;

    // Average reward per transaction
    const totalIssued = issuanceEvents.reduce((sum, e) => sum + e.amount, 0);
    const avgRewardPerTx = issuanceEvents.length > 0 ? totalIssued / issuanceEvents.length : 0;

    // Redemption rate (redeemed / issued)
    const totalRedeemed = redemptions.reduce((sum, r) => sum + r.amount, 0);
    const redemptionRate = totalIssued > 0 ? (totalRedeemed / totalIssued) * 100 : 0;

    // Retention rate (customers with multiple transactions)
    const customerTxCount = new Map<string, number>();
    issuanceEvents.forEach((e) => {
      const count = customerTxCount.get(e.customerWallet) || 0;
      customerTxCount.set(e.customerWallet, count + 1);
    });
    const returningCustomers = Array.from(customerTxCount.values()).filter((count) => count > 1).length;
    const retentionRate = customerTxCount.size > 0 ? (returningCustomers / customerTxCount.size) * 100 : 0;

    // New customers in this period
    const now = Date.now() / 1000;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90, "custom": 365 };
    const days = daysMap[dateRange];
    const cutoffTime = now - days * 24 * 60 * 60;
    const newCustomers = customers.filter((c) => c.registeredAt >= cutoffTime).length;

    return {
      avgRewardPerTx,
      redemptionRate,
      retentionRate,
      newCustomers,
      totalCustomers: customers.length,
    };
  }, [filteredData, dateRange]);

  // Time series data for chart
  const timeSeriesData = useMemo((): TimeSeriesData[] => {
    const { issuanceEvents, redemptions } = filteredData;
    const dataMap = new Map<string, { issued: number; redeemed: number }>();

    // Group issuance by date
    issuanceEvents.forEach((event) => {
      const date = new Date(event.timestamp * 1000).toISOString().split("T")[0];
      const existing = dataMap.get(date) || { issued: 0, redeemed: 0 };
      dataMap.set(date, { ...existing, issued: existing.issued + event.amount });
    });

    // Group redemptions by date
    redemptions.forEach((redemption) => {
      const date = new Date(redemption.timestamp * 1000).toISOString().split("T")[0];
      const existing = dataMap.get(date) || { issued: 0, redeemed: 0 };
      dataMap.set(date, { ...existing, redeemed: existing.redeemed + redemption.amount });
    });

    // Convert to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Tier distribution
  const tierDistribution = useMemo((): TierDistribution => {
    const distribution = { bronze: 0, silver: 0, gold: 0, platinum: 0 };

    customers.forEach((customer) => {
      const tier = customer.tier.toLowerCase();
      if (tier in distribution) {
        distribution[tier as keyof TierDistribution]++;
      }
    });

    return distribution;
  }, [customers]);

  // Redemption breakdown by offer
  const redemptionBreakdown = useMemo((): RedemptionBreakdown[] => {
    const { redemptions } = filteredData;
    const offerCounts = new Map<string, number>();

    redemptions.forEach((r) => {
      const count = offerCounts.get(r.offerName) || 0;
      offerCounts.set(r.offerName, count + 1);
    });

    const total = redemptions.length;
    return Array.from(offerCounts.entries())
      .map(([offerName, count]) => ({
        offerName,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [filteredData]);

  // Top customers
  const topCustomers = useMemo(() => {
    return customers
      .map((customer) => {
        // Calculate total earned from issuance events
        const earned = issuanceEvents
          .filter((e) => e.customerWallet === customer.wallet)
          .reduce((sum, e) => sum + e.amount, 0);

        // Calculate total redeemed
        const redeemed = redemptions
          .filter((r) => r.customerWallet === customer.wallet)
          .reduce((sum, r) => sum + r.amount, 0);

        // Find last activity
        const lastIssuance = issuanceEvents
          .filter((e) => e.customerWallet === customer.wallet)
          .sort((a, b) => b.timestamp - a.timestamp)[0];

        const lastRedemption = redemptions
          .filter((r) => r.customerWallet === customer.wallet)
          .sort((a, b) => b.timestamp - a.timestamp)[0];

        const lastActivity = Math.max(
          lastIssuance?.timestamp || 0,
          lastRedemption?.timestamp || 0
        );

        return {
          ...customer,
          earned,
          redeemed,
          lastActivity,
        };
      })
      .sort((a, b) => b.earned - a.earned)
      .slice(0, 10); // Top 10
  }, [customers, issuanceEvents, redemptions]);

  return {
    isLoading,
    metrics,
    timeSeriesData,
    tierDistribution,
    redemptionBreakdown,
    topCustomers,
  };
}
