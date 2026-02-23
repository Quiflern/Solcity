"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCustomerAccount } from "@/hooks/customer/useCustomerAccount";
import { useTransactionHistory } from "@/hooks/customer/useTransactionHistory";
import { getTierInfo } from "@/lib/tiers";

/**
 * Transaction History Page
 *
 * Displays comprehensive transaction history for customers with:
 * - Filterable transaction list (all, earned, redeemed)
 * - Date range filtering (7d, 30d, 90d, all time)
 * - Summary statistics for selected period
 * - Transaction details including merchant, amount, and blockchain signature
 * - Visual indicators for transaction types
 *
 * @returns Transaction history component with filtering and statistics
 */
export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "earned" | "redeemed">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );

  const { customerAccount, isLoading: customerLoading } = useCustomerAccount();
  const { data: transactions = [], isLoading: txLoading } =
    useTransactionHistory();

  /**
   * Calculates the timestamp threshold for date filtering
   * @returns Timestamp in milliseconds for the start of the selected period
   */
  const dateRangeMs = useMemo(() => {
    const now = Date.now();
    switch (dateFilter) {
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return now - 90 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }, [dateFilter]);

  /**
   * Filters transactions based on active tab and date range
   * @returns Filtered transaction array
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by transaction type (tab)
      if (activeTab === "earned" && tx.type !== "earned") return false;
      if (activeTab === "redeemed" && tx.type !== "redeemed") return false;

      // Filter by date range
      const txDate = tx.timestamp * 1000;
      if (dateFilter !== "all" && txDate < dateRangeMs) return false;

      return true;
    });
  }, [transactions, activeTab, dateFilter, dateRangeMs]);

  /**
   * Calculates summary statistics for the selected period
   * @returns Object with earned, redeemed, and net amounts
   */
  const stats = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      const txDate = tx.timestamp * 1000;
      return dateFilter === "all" || txDate >= dateRangeMs;
    });

    const earned = filtered
      .filter((tx) => tx.type === "earned")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const redeemed = filtered
      .filter((tx) => tx.type === "redeemed")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      earned,
      redeemed,
      net: earned - redeemed,
    };
  }, [transactions, dateFilter, dateRangeMs]);

  const tierInfo = customerAccount?.tier
    ? getTierInfo(customerAccount.tier)
    : { displayName: "Bronze", color: "#cd7f32" };

  /**
   * Formats a Unix timestamp to readable date string
   * @param timestamp - Unix timestamp in seconds
   * @returns Formatted date string (e.g., "Jan 15, 2:30 PM")
   */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Formats a transaction signature to shortened display format
   * @param sig - Full transaction signature
   * @returns Shortened signature (e.g., "AbC1...XyZ9")
   */
  const formatSignature = (sig: string) => {
    return `${sig.slice(0, 4)}...${sig.slice(-4)}`;
  };

  /**
   * Returns a human-readable label for the selected date filter
   * @returns Period label string
   */
  const getPeriodLabel = () => {
    switch (dateFilter) {
      case "7d":
        return "this week";
      case "30d":
        return "this month";
      case "90d":
        return "last 90 days";
      default:
        return "all time";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-text">
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          {/* Page Header */}
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-[1.75rem] font-bold">Reward History</h1>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-panel border border-border p-8 rounded-lg">
              <div className="text-[0.7rem] uppercase text-text-secondary mb-4 tracking-wider">
                Earned {getPeriodLabel()}
              </div>
              {customerLoading || txLoading ? (
                <div className="h-9 bg-border/20 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-semibold">
                  {stats.earned.toLocaleString()} SLCY
                </div>
              )}
            </div>
            <div className="bg-panel border border-border p-8 rounded-lg">
              <div className="text-[0.7rem] uppercase text-text-secondary mb-4 tracking-wider">
                Redeemed {getPeriodLabel()}
              </div>
              {customerLoading || txLoading ? (
                <div className="h-9 bg-border/20 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-semibold">
                  {stats.redeemed.toLocaleString()} SLCY
                </div>
              )}
            </div>
            <div className="bg-panel border border-border p-8 rounded-lg">
              <div className="text-[0.7rem] uppercase text-text-secondary mb-4 tracking-wider">
                Net growth
              </div>
              {customerLoading || txLoading ? (
                <div className="h-9 bg-border/20 rounded animate-pulse" />
              ) : (
                <div
                  className={`text-3xl font-semibold ${stats.net >= 0 ? "text-accent" : "text-red-400"}`}
                >
                  {stats.net >= 0 ? "+" : ""}
                  {stats.net.toLocaleString()} SLCY
                </div>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex justify-between items-center mb-8 border-b border-border pb-0">
            <div className="flex gap-8">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`pb-4 text-sm font-medium relative ${
                  activeTab === "all" ? "text-text" : "text-text-secondary"
                }`}
              >
                All Activity
                {activeTab === "all" && (
                  <span className="absolute -bottom-px left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("earned")}
                className={`pb-4 text-sm font-medium relative ${
                  activeTab === "earned" ? "text-text" : "text-text-secondary"
                }`}
              >
                Earned
                {activeTab === "earned" && (
                  <span className="absolute -bottom-px left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("redeemed")}
                className={`pb-4 text-sm font-medium relative ${
                  activeTab === "redeemed" ? "text-text" : "text-text-secondary"
                }`}
              >
                Redeemed
                {activeTab === "redeemed" && (
                  <span className="absolute -bottom-px left-0 w-full h-[2px] bg-accent" />
                )}
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setDateFilter("7d")}
                className={`px-3 py-1.5 rounded text-xs ${
                  dateFilter === "7d"
                    ? "bg-panel border border-border text-text"
                    : "bg-transparent border border-transparent text-text-secondary"
                }`}
              >
                7d
              </button>
              <button
                type="button"
                onClick={() => setDateFilter("30d")}
                className={`px-3 py-1.5 rounded text-xs ${
                  dateFilter === "30d"
                    ? "bg-panel border border-border text-text"
                    : "bg-transparent border border-transparent text-text-secondary"
                }`}
              >
                30d
              </button>
              <button
                type="button"
                onClick={() => setDateFilter("90d")}
                className={`px-3 py-1.5 rounded text-xs ${
                  dateFilter === "90d"
                    ? "bg-panel border border-border text-text"
                    : "bg-transparent border border-transparent text-text-secondary"
                }`}
              >
                90d
              </button>
              <button
                type="button"
                onClick={() => setDateFilter("all")}
                className={`px-3 py-1.5 rounded text-xs ${
                  dateFilter === "all"
                    ? "bg-panel border border-border text-text"
                    : "bg-transparent border border-transparent text-text-secondary"
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            {txLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-text-secondary">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary mb-2 font-semibold">
                  No transactions found
                </p>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  {activeTab === "all"
                    ? "Your transaction history will appear here once you earn or redeem rewards. Visit merchants to start earning!"
                    : activeTab === "earned"
                      ? "You haven't earned any rewards yet. Make purchases at participating merchants to start earning SLCY tokens."
                      : "You haven't redeemed any rewards yet. Visit the Redeem page to exchange your SLCY tokens for offers."}
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Date / Time
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Merchant
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Type
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Tier
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Amount
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary p-6 border-b border-border tracking-wider">
                      Signature
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => (
                    <tr key={tx.signature}>
                      <td
                        className={`py-5 px-6 text-sm ${
                          index !== filteredTransactions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        {formatDate(tx.timestamp)}
                      </td>
                      <td
                        className={`py-5 px-6 text-sm ${
                          index !== filteredTransactions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        {tx.merchant}
                      </td>
                      <td
                        className={`py-5 px-6 text-sm ${
                          index !== filteredTransactions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            tx.type === "earned"
                              ? "bg-accent/10 text-accent"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {tx.type === "earned" ? "Earned" : "Redeemed"}
                        </span>
                      </td>
                      <td
                        className={`py-5 px-6 text-sm ${
                          index !== filteredTransactions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {tierInfo.displayName}
                        </div>
                      </td>
                      <td
                        className={`py-5 px-6 text-sm font-semibold ${
                          tx.type === "earned" ? "text-accent" : "text-red-400"
                        } ${index !== filteredTransactions.length - 1 ? "border-b border-border" : ""}`}
                      >
                        {tx.type === "earned" ? "+" : "-"}
                        {tx.amount.toLocaleString()} SLCY
                      </td>
                      <td
                        className={`py-5 px-6 text-sm ${
                          index !== filteredTransactions.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=custom&customUrl=http://localhost:8899`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary font-mono text-xs hover:text-accent transition-colors"
                        >
                          {formatSignature(tx.signature)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
