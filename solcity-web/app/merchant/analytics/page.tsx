"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { useMerchantAnalytics } from "@/hooks/merchant/useMerchantAnalytics";
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
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">(
    "30d",
  );
  const [showTierInfo, setShowTierInfo] = useState(false);

  // Get merchant PDA for analytics
  const merchantPDA = publicKey
    ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
    : null;
  const {
    isLoading: analyticsLoading,
    metrics,
    timeSeriesData,
    tierDistribution,
    redemptionBreakdown,
    topCustomers,
  } = useMerchantAnalytics(merchantPDA, dateRange);

  const isLoading = merchantLoading || analyticsLoading;

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
                <h1 className="text-2xl font-bold">Performance Analytics</h1>
                <div className="flex bg-panel border border-border rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setDateRange("7d")}
                    className={`px-4 py-2 text-xs font-semibold rounded-md ${
                      dateRange === "7d"
                        ? "bg-border text-text"
                        : "bg-transparent text-text-secondary"
                    }`}
                  >
                    7D
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateRange("30d")}
                    className={`px-4 py-2 text-xs font-semibold rounded-md ${
                      dateRange === "30d"
                        ? "bg-border text-text"
                        : "bg-transparent text-text-secondary"
                    }`}
                  >
                    30D
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateRange("90d")}
                    className={`px-4 py-2 text-xs font-semibold rounded-md ${
                      dateRange === "90d"
                        ? "bg-border text-text"
                        : "bg-transparent text-text-secondary"
                    }`}
                  >
                    90D
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateRange("custom")}
                    className={`px-4 py-2 text-xs font-semibold rounded-md ${
                      dateRange === "custom"
                        ? "bg-border text-text"
                        : "bg-transparent text-text-secondary"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
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

              {/* Charts Grid */}
              <div className="grid grid-cols-[2fr_1fr] gap-6 mb-6">
                {/* Issuance & Redemption Volume */}
                <div className="bg-panel border border-border rounded-xl p-6">
                  <div className="text-sm font-semibold mb-6">
                    Issuance & Redemption Volume
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
                          fill="#444"
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
                      <div className="w-2 h-2 rounded-sm bg-[#444]" />
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
                  ) : (
                    <>
                      <div className="flex items-center justify-center relative h-[200px]">
                        <div className="w-[140px] h-[140px] rounded-full border-[15px] border-[#CD7F32] border-t-accent border-r-[#FFD700] border-b-[#C0C0C0] rotate-45" />
                        <div className="absolute text-center">
                          <div className="text-xl font-bold">
                            {metrics.totalCustomers}
                          </div>
                          <div className="text-[0.6rem] text-text-secondary">
                            TOTAL
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-accent/10 border border-accent" />
                          Plat (
                          {metrics.totalCustomers > 0
                            ? (
                                (tierDistribution.platinum /
                                  metrics.totalCustomers) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-[#FFD700]/10 border border-[#FFD700]" />
                          Gold (
                          {metrics.totalCustomers > 0
                            ? (
                                (tierDistribution.gold /
                                  metrics.totalCustomers) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-[#C0C0C0]/10 border border-[#C0C0C0]" />
                          Silver (
                          {metrics.totalCustomers > 0
                            ? (
                                (tierDistribution.silver /
                                  metrics.totalCustomers) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-2 h-2 rounded-sm bg-[#CD7F32]/10 border border-[#CD7F32]" />
                          Bronze (
                          {metrics.totalCustomers > 0
                            ? (
                                (tierDistribution.bronze /
                                  metrics.totalCustomers) *
                                100
                              ).toFixed(0)
                            : 0}
                          %)
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Second Row Charts */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Customer Growth */}
                <div className="bg-panel border border-border rounded-xl p-6">
                  <div className="text-sm font-semibold mb-6">
                    Customer Growth
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
                      <LineChart data={timeSeriesData}>
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
                        />
                        <Line
                          type="monotone"
                          dataKey="issued"
                          stroke="#c0ff00"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
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

              {/* Top Performing Customers */}
              <div className="mt-4">
                <h3 className="text-lg mb-6">Top Performing Customers</h3>
                {isLoading ? (
                  <div className="bg-panel border border-border rounded-xl p-12 text-center">
                    <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-text-secondary text-sm">
                      Loading customers...
                    </p>
                  </div>
                ) : topCustomers.length === 0 ? (
                  <div className="bg-panel border border-border rounded-xl p-12 text-center">
                    <p className="text-text-secondary text-sm">
                      No customers yet
                    </p>
                    <p className="text-text-secondary text-xs mt-2">
                      Customers will appear here once they register
                    </p>
                  </div>
                ) : (
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
                        {topCustomers.map((customer: TopCustomer) => {
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
                            <tr key={customer.publicKey}>
                              <td className="py-5 px-6 border-b border-border text-sm">
                                <code>
                                  {customer.wallet.slice(0, 4)}...
                                  {customer.wallet.slice(-4)}
                                </code>
                              </td>
                              <td className="py-5 px-6 border-b border-border text-sm">
                                {customer.earned.toLocaleString()} SLCY
                              </td>
                              <td className="py-5 px-6 border-b border-border text-sm">
                                {customer.redeemed.toLocaleString()} SLCY
                              </td>
                              <td className="py-5 px-6 border-b border-border text-sm">
                                <span
                                  className={`text-[0.7rem] px-2 py-0.5 rounded uppercase font-semibold ${
                                    customer.tier === "Platinum"
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
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Tier Info Modal */}
        {showTierInfo && (
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
                          No merchant configuration needed - it's all handled
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
        )}
      </div>
    </ProtectedRoute>
  );
}
