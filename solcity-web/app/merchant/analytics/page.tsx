"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { useMerchantAnalytics } from "@/hooks/merchant/useMerchantAnalytics";
import { useMerchantCustomerRecords } from "@/hooks/merchant/useMerchantCustomerRecords";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

/**
 * Merchant Analytics Dashboard Page
 *
 * Comprehensive analytics and insights for merchant loyalty program performance.
 *
 * Features:
 * - Key Performance Metrics:
 *   - Total tokens issued and redeemed
 *   - Active customers count
 *   - Average transaction value
 *   - Redemption rate
 *
 * - Time-Series Charts:
 *   - Daily issuance and redemption trends
 *   - Customer growth over time
 *   - Transaction volume patterns
 *
 * - Customer Insights:
 *   - Top customers by earnings
 *   - Customer tier distribution
 *   - Engagement metrics
 *
 * - Date Range Filtering:
 *   - Last 7 days, 30 days, 90 days
 *   - Custom date range selection
 *
 * All data is aggregated from on-chain events and customer accounts.
 *
 * @returns Analytics dashboard with charts, metrics, and customer insights
 */

/**
 * Customer analytics data structure
 * Extends customer data with calculated metrics
 */
interface TopCustomer {
  publicKey: string;
  wallet: string;
  tier: string;
  totalEarned: number;
  totalRedeemed: number;
  transactionCount: number;
  registeredAt: number;
  earned: number; // Calculated from issuance events
  redeemed: number; // Calculated from redemptions
  lastActivity: number; // Timestamp of last transaction
}

export default function MerchantAnalyticsPage() {
  const { publicKey } = useWallet();
  const {
    merchantAccount,
    isLoading: merchantLoading,
    isRegistered,
  } = useMerchantAccount();
  const [showTierInfo, setShowTierInfo] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Get merchant PDA for analytics
  const merchantPDA = publicKey
    ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
    : null;
  const {
    isLoading: analyticsLoading,
    isFetching,
    metrics,
    timeSeriesData,
    tierDistribution,
    redemptionBreakdown,
    topCustomers,
    dataUpdatedAt,
    refetch,
  } = useMerchantAnalytics(merchantPDA, "30d");

  // Fetch on-chain merchant-customer records for fast analytics
  const {
    data: customerRecords,
    isLoading: recordsLoading,
    refetch: refetchRecords,
  } = useMerchantCustomerRecords(merchantPDA);

  const isLoading = merchantLoading || analyticsLoading;

  // Calculate how long ago data was fetched
  const getDataAge = () => {
    if (!dataUpdatedAt) return null;
    const ageMs = Date.now() - dataUpdatedAt;
    const ageMinutes = Math.floor(ageMs / 60000);
    if (ageMinutes < 1) return "just now";
    if (ageMinutes === 1) return "1 minute ago";
    return `${ageMinutes} minutes ago`;
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard!", {
      duration: 2000,
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
        {/* Container */}
        <div className="max-w-[1400px] mx-auto px-8 w-full py-12">
          {merchantLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading merchant data...</p>
            </div>
          ) : !isRegistered && publicKey ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-panel border border-border rounded-xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  No Merchant Account Found
                </h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  You need to register as a merchant before you can access
                  analytics. Register your business to get started with your
                  loyalty program.
                </p>
                <a
                  href="/merchant/register"
                  className="inline-block bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                >
                  Register as Merchant
                </a>
              </div>
            </div>
          ) : merchantAccount ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Performance Analytics</h1>
                  <button
                    type="button"
                    onClick={() => setShowCustomerList(!showCustomerList)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${showCustomerList
                      ? "bg-accent text-black"
                      : "bg-panel border border-border text-text hover:border-accent"
                      }`}
                  >
                    {showCustomerList ? "Show Analytics" : "View All Customers"}
                  </button>
                  {dataUpdatedAt && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Updated {getDataAge()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="px-4 py-2 text-sm rounded-lg bg-panel border border-border text-text hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title="Refresh data from blockchain"
                >
                  <svg
                    className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Key Metrics */}
              {!showCustomerList && (
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
                      Avg Reward / Tx
                    </div>
                    <div className="text-2xl font-semibold">
                      {isLoading
                        ? "..."
                        : `${metrics.avgRewardPerTx.toFixed(1)} SLCY`}
                    </div>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
                      Redemption Rate
                    </div>
                    <div className="text-2xl font-semibold">
                      {isLoading
                        ? "..."
                        : `${metrics.redemptionRate.toFixed(1)}%`}
                    </div>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
                      Retention Rate
                    </div>
                    <div className="text-2xl font-semibold">
                      {isLoading ? "..." : `${metrics.retentionRate.toFixed(1)}%`}
                    </div>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
                      New Customers
                    </div>
                    <div className="text-2xl font-semibold">
                      {isLoading ? "..." : `+${metrics.newCustomers}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Grid */}
              {!showCustomerList && (
                <>
                  <div className="grid grid-cols-[2fr_1fr] gap-6 mb-6">
                    {/* Transaction & Redemption Volume - Bar Graph */}
                    <div className="bg-panel border border-border rounded-xl p-6">
                      <div className="text-sm font-semibold mb-6">
                        Transaction & Redemption Volume
                      </div>
                      {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
                        </div>
                      ) : timeSeriesData.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
                          No data available for this period
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={timeSeriesData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#333"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              stroke="#888"
                              style={{ fontSize: "0.7rem" }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }
                            />
                            <YAxis
                              stroke="#888"
                              style={{ fontSize: "0.7rem" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "0.875rem",
                              }}
                              cursor={{ fill: "rgba(192, 255, 0, 0.05)" }}
                            />
                            <Bar
                              dataKey="issued"
                              fill="#c0ff00"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="redeemed"
                              fill="#888"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      <div className="flex gap-5 mt-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-accent" />
                          Issued
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-[#888]" />
                          Redeemed
                        </div>
                      </div>
                    </div>

                    {/* Tier Distribution */}
                    <div className="bg-panel border border-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm font-semibold">
                          Tier Distribution
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTierInfo(true)}
                          className="text-accent hover:text-accent/80 transition-colors"
                          title="Learn about customer tiers"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <title>Information</title>
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      {isLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
                        </div>
                      ) : metrics.totalCustomers === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
                          No customers yet
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {[
                              { name: "Platinum", count: tierDistribution.platinum, color: "#c0ff00" },
                              { name: "Gold", count: tierDistribution.gold, color: "#FFD700" },
                              { name: "Silver", count: tierDistribution.silver, color: "#C0C0C0" },
                              { name: "Bronze", count: tierDistribution.bronze, color: "#CD7F32" },
                            ].map((tier) => {
                              const percentage = metrics.totalCustomers > 0
                                ? (tier.count / metrics.totalCustomers) * 100
                                : 0;
                              return (
                                <div
                                  key={tier.name}
                                  className="group cursor-pointer"
                                >
                                  <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-sm transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: tier.color }}
                                      />
                                      <span className="text-sm font-medium group-hover:text-accent transition-colors">
                                        {tier.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-text-secondary">
                                        {tier.count} customers
                                      </span>
                                      <span className="text-sm font-semibold text-accent min-w-12 text-right">
                                        {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                    <div
                                      className="h-full transition-all duration-300 group-hover:opacity-100"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: tier.color,
                                        opacity: 0.8
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-6 pt-4 border-t border-border">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-text-secondary">Total Customers</span>
                              <span className="text-lg font-bold">{metrics.totalCustomers}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Second Row Charts */}
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    {/* Transaction Volume - Stacked Area Chart */}
                    <div className="bg-panel border border-border rounded-xl p-6">
                      <div className="text-sm font-semibold mb-6">
                        Transaction Volume
                      </div>
                      {isLoading ? (
                        <div className="h-[140px] flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
                        </div>
                      ) : timeSeriesData.length === 0 ? (
                        <div className="h-[140px] flex items-center justify-center text-text-secondary text-sm">
                          No data available
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={140}>
                          <LineChart
                            data={timeSeriesData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                              dataKey="date"
                              stroke="#888"
                              style={{ fontSize: "0.7rem" }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }
                            />
                            <YAxis
                              stroke="#888"
                              style={{ fontSize: "0.7rem" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "1px solid #333",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "0.875rem",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="issued"
                              stroke="#c0ff00"
                              strokeWidth={3}
                              dot={{ fill: "#c0ff00", r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="redeemed"
                              stroke="#888"
                              strokeWidth={3}
                              dot={{ fill: "#888", r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      <div className="flex gap-5 mt-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-accent" />
                          Issued
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-[#888]" />
                          Redeemed
                        </div>
                      </div>
                    </div>

                    {/* Redemption Breakdown */}
                    <div className="bg-panel border border-border rounded-xl p-6">
                      <div className="text-sm font-semibold mb-6">
                        Redemption Breakdown
                      </div>
                      {isLoading ? (
                        <div className="h-[140px] flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin" />
                        </div>
                      ) : redemptionBreakdown.length === 0 ? (
                        <div className="h-[140px] flex items-center justify-center text-text-secondary text-sm">
                          No redemptions yet
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {redemptionBreakdown.slice(0, 3).map((item) => (
                            <div key={item.offerName}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="truncate">{item.offerName}</span>
                                <span className="text-accent">
                                  {item.percentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Customer Relationships (On-Chain Records) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg">Active Customers</h3>
                        <p className="text-xs text-text-secondary mt-1">
                          Customers who have transacted with your business
                        </p>
                      </div>
                      {customerRecords && customerRecords.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-accent font-semibold">
                            {customerRecords.length} active {customerRecords.length === 1 ? 'customer' : 'customers'}
                          </div>
                          <div className="px-2 py-1 bg-accent/10 rounded text-xs text-accent">
                            ⚡ Fast
                          </div>
                        </div>
                      )}
                    </div>
                    {recordsLoading ? (
                      <div className="bg-panel border border-border rounded-xl p-12 text-center">
                        <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-text-secondary text-sm">
                          Loading customer records...
                        </p>
                      </div>
                    ) : !customerRecords || customerRecords.length === 0 ? (
                      <div className="bg-panel border border-border rounded-xl p-12 text-center">
                        <p className="text-text-secondary text-sm">
                          No active customers yet
                        </p>
                        <p className="text-text-secondary text-xs mt-2">
                          Customer records are created when they earn or redeem tokens
                        </p>
                      </div>
                    ) : (
                      <div className="bg-panel border border-border rounded-xl overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white/2">
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Customer
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Tokens Issued
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Tokens Redeemed
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Transactions
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                First / Last Activity
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerRecords.slice(0, 10).map((record) => {
                              const firstDate = new Date(record.firstTransaction * 1000);
                              const lastDate = new Date(record.lastTransaction * 1000);
                              const daysSinceFirst = Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
                              const daysSinceLast = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                              return (
                                <tr key={record.publicKey} className="hover:bg-white/5 transition-colors">
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs font-mono">
                                        {record.customer.slice(0, 4)}...{record.customer.slice(-4)}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(record.customer)}
                                        className="text-text-secondary hover:text-accent transition-colors"
                                        title="Copy address"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    <span className="text-accent font-semibold">{record.totalIssued.toLocaleString()}</span> SLCY
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    <span className="font-semibold">{record.totalRedeemed.toLocaleString()}</span> SLCY
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    {record.transactionCount}
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm text-text-secondary">
                                    <div className="text-xs">
                                      <div>{daysSinceFirst === 0 ? 'Today' : `${daysSinceFirst}d ago`}</div>
                                      <div className="text-[0.65rem] text-text-secondary/70">
                                        Last: {daysSinceLast === 0 ? 'Today' : `${daysSinceLast}d ago`}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="p-4 bg-black/20 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-text-secondary">
                            <span className="text-accent">⚡ Fast:</span> Data fetched directly from on-chain analytics records
                          </p>
                          {customerRecords.length > 10 && (
                            <button
                              type="button"
                              onClick={() => setShowCustomerList(true)}
                              className="text-xs text-accent hover:text-accent/80 transition-colors"
                            >
                              View all {customerRecords.length} customers →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Registered Customers (includes non-transacting) */}
                  {topCustomers.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg">All Registered Customers</h3>
                          <p className="text-xs text-text-secondary mt-1">
                            Everyone registered in the loyalty program (including those who haven't transacted yet)
                          </p>
                        </div>
                      </div>
                      <div className="bg-panel border border-border rounded-xl overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white/2">
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Wallet Address
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Total Earned
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Total Redeemed
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Tier Status
                              </th>
                              <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                                Last Activity
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {topCustomers.slice(0, 5).map((customer: TopCustomer) => {
                              const lastActivityDate = new Date(
                                customer.lastActivity * 1000,
                              );
                              const now = new Date();
                              const diffMs =
                                now.getTime() - lastActivityDate.getTime();
                              const diffHours = Math.floor(
                                diffMs / (1000 * 60 * 60),
                              );
                              const diffDays = Math.floor(diffHours / 24);

                              let lastActivityText = "Never";
                              if (customer.lastActivity > 0) {
                                if (diffHours < 1) {
                                  lastActivityText = "Just now";
                                } else if (diffHours < 24) {
                                  lastActivityText = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
                                } else if (diffDays === 1) {
                                  lastActivityText = "Yesterday";
                                } else {
                                  lastActivityText = `${diffDays} days ago`;
                                }
                              }

                              return (
                                <tr key={customer.publicKey} className="hover:bg-white/5 transition-colors">
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs font-mono">
                                        {customer.wallet.slice(0, 4)}...{customer.wallet.slice(-4)}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(customer.wallet)}
                                        className="text-text-secondary hover:text-accent transition-colors shrink-0"
                                        title="Copy address"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    {customer.totalEarned.toLocaleString()} <span className="text-accent font-semibold">SLCY</span>
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    {customer.totalRedeemed.toLocaleString()} <span className="text-accent font-semibold">SLCY</span>
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm">
                                    <span
                                      className={`text-[0.7rem] px-2 py-0.5 rounded uppercase font-semibold ${customer.tier === "Platinum"
                                        ? "bg-accent/10 text-accent"
                                        : customer.tier === "Gold"
                                          ? "bg-[#FFD700]/10 text-[#FFD700]"
                                          : customer.tier === "Silver"
                                            ? "bg-[#C0C0C0]/10 text-[#C0C0C0]"
                                            : "bg-[#CD7F32]/10 text-[#CD7F32]"
                                        }`}
                                    >
                                      {customer.tier}
                                    </span>
                                  </td>
                                  <td className="py-5 px-6 border-b border-border text-sm text-text-secondary">
                                    {lastActivityText}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="p-4 bg-black/20 border-t border-border">
                          <p className="text-xs text-text-secondary">
                            Showing top 5 customers. Click "View All Customers" above to see everyone.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Customer List View */}
              {showCustomerList && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search by wallet address..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full bg-panel border border-border rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:border-accent"
                      />
                      <svg
                        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-text-secondary">
                      {topCustomers.filter((c: TopCustomer) =>
                        c.wallet.toLowerCase().includes(customerSearchQuery.toLowerCase())
                      ).length} of {topCustomers.length} customers
                    </div>
                  </div>

                  {/* Customer Cards Grid */}
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-panel border border-border rounded-xl p-6 animate-pulse">
                          <div className="h-4 bg-border rounded w-3/4 mb-4" />
                          <div className="h-3 bg-border rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : topCustomers.filter((c: TopCustomer) =>
                    c.wallet.toLowerCase().includes(customerSearchQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="bg-panel border border-border rounded-xl p-12 text-center">
                      <p className="text-text-secondary">
                        {customerSearchQuery ? "No customers match your search" : "No customers yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topCustomers
                        .filter((c: TopCustomer) =>
                          c.wallet.toLowerCase().includes(customerSearchQuery.toLowerCase())
                        )
                        .map((customer: TopCustomer) => {
                          const lastActivityDate = new Date(customer.lastActivity * 1000);
                          const now = new Date();
                          const diffMs = now.getTime() - lastActivityDate.getTime();
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                          return (
                            <div
                              key={customer.publicKey}
                              className="bg-panel border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
                            >
                              {/* Wallet Address */}
                              <div className="flex items-center justify-between mb-4">
                                <code className="text-xs text-text-secondary">
                                  {customer.wallet.slice(0, 6)}...{customer.wallet.slice(-6)}
                                </code>
                                <span
                                  className={`text-[0.65rem] px-2 py-0.5 rounded uppercase font-semibold ${customer.tier === "Platinum"
                                    ? "bg-accent/10 text-accent"
                                    : customer.tier === "Gold"
                                      ? "bg-[#FFD700]/10 text-[#FFD700]"
                                      : customer.tier === "Silver"
                                        ? "bg-[#C0C0C0]/10 text-[#C0C0C0]"
                                        : "bg-[#CD7F32]/10 text-[#CD7F32]"
                                    }`}
                                >
                                  {customer.tier}
                                </span>
                              </div>

                              {/* Stats */}
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[0.65rem] uppercase text-text-secondary mb-1">
                                    Total Earned
                                  </div>
                                  <div className="text-lg font-semibold">
                                    {customer.totalEarned.toLocaleString()} SLCY
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[0.65rem] uppercase text-text-secondary mb-1">
                                    Total Redeemed
                                  </div>
                                  <div className="text-lg font-semibold">
                                    {customer.totalRedeemed.toLocaleString()} SLCY
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <div>
                                    <div className="text-[0.65rem] uppercase text-text-secondary mb-1">
                                      Transactions
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {customer.transactionCount}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[0.65rem] uppercase text-text-secondary mb-1">
                                      Last Active
                                    </div>
                                    <div className="text-sm font-semibold">
                                      {customer.lastActivity > 0
                                        ? diffDays === 0
                                          ? "Today"
                                          : diffDays === 1
                                            ? "Yesterday"
                                            : `${diffDays}d ago`
                                        : "Never"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null
          }
        </div >

        {/* Tier Info Modal */}
        {
          showTierInfo && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
              <div className="bg-panel border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Customer Tier System</h2>
                    <button
                      type="button"
                      onClick={() => setShowTierInfo(false)}
                      className="text-text-secondary hover:text-text transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <title>Close</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                      <p className="text-sm text-text-secondary">
                        Customer tiers are{" "}
                        <span className="text-accent font-semibold">
                          automatically calculated
                        </span>{" "}
                        based on lifetime tokens earned. As customers earn more,
                        they unlock higher tiers with better reward multipliers.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Platinum */}
                      <div className="bg-black border border-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-accent" />
                            <h3 className="text-lg font-semibold text-accent">
                              Platinum
                            </h3>
                          </div>
                          <span className="text-accent font-bold">
                            2.0x Multiplier
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          50,000+ lifetime tokens earned
                        </p>
                        <p className="text-xs text-text-secondary">
                          Elite customers earn double rewards on every purchase
                        </p>
                      </div>

                      {/* Gold */}
                      <div className="bg-black border border-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-[#FFD700]" />
                            <h3 className="text-lg font-semibold text-[#FFD700]">
                              Gold
                            </h3>
                          </div>
                          <span className="text-[#FFD700] font-bold">
                            1.5x Multiplier
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          10,000 - 49,999 lifetime tokens earned
                        </p>
                        <p className="text-xs text-text-secondary">
                          Loyal customers earn 50% bonus rewards
                        </p>
                      </div>

                      {/* Silver */}
                      <div className="bg-black border border-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-[#C0C0C0]" />
                            <h3 className="text-lg font-semibold text-[#C0C0C0]">
                              Silver
                            </h3>
                          </div>
                          <span className="text-[#C0C0C0] font-bold">
                            1.25x Multiplier
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          1,000 - 9,999 lifetime tokens earned
                        </p>
                        <p className="text-xs text-text-secondary">
                          Regular customers earn 25% bonus rewards
                        </p>
                      </div>

                      {/* Bronze */}
                      <div className="bg-black border border-border rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm bg-[#CD7F32]" />
                            <h3 className="text-lg font-semibold text-[#CD7F32]">
                              Bronze
                            </h3>
                          </div>
                          <span className="text-[#CD7F32] font-bold">
                            1.0x Multiplier
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">
                          0 - 999 lifetime tokens earned
                        </p>
                        <p className="text-xs text-text-secondary">
                          New customers start here with standard rewards
                        </p>
                      </div>
                    </div>

                    <div className="bg-black border border-dashed border-border rounded-lg p-5">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-accent"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <title>Star</title>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        How It Works
                      </h4>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>
                            Tiers are calculated automatically based on lifetime
                            tokens earned
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>
                            Customers are upgraded instantly when they reach the
                            next tier threshold
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>
                            Multipliers are applied automatically when issuing
                            rewards
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span>
                          <span>
                            No merchant configuration needed - it&apos;s all handled
                            on-chain
                          </span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTierInfo(false)}
                      className="w-full bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                    >
                      Got It
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </ProtectedRoute >
  );
}