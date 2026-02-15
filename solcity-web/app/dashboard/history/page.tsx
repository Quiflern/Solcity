"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

export default function RewardHistoryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "earned" | "redeemed">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "90d" | "all">(
    "30d",
  );

  const transactions = [
    {
      id: "tx-1",
      date: "Oct 24, 14:20",
      merchant: "Solana Coffee",
      type: "reward",
      tier: "Platinum",
      amount: "+45.00 SOLC",
      positive: true,
      signature: "5x9A...k7Wp",
    },
    {
      id: "tx-2",
      date: "Oct 23, 09:15",
      merchant: "Elite Fitness",
      type: "redeem",
      tier: "Platinum",
      amount: "-150.00 SOLC",
      positive: false,
      signature: "8r2B...m2Nq",
    },
    {
      id: "tx-3",
      date: "Oct 22, 18:42",
      merchant: "The Solana Store",
      type: "reward",
      tier: "Gold",
      amount: "+210.50 SOLC",
      positive: true,
      signature: "2z7Y...v0Lx",
    },
    {
      id: "tx-4",
      date: "Oct 21, 11:30",
      merchant: "Cyber Cafe",
      type: "reward",
      tier: "Gold",
      amount: "+12.20 SOLC",
      positive: true,
      signature: "9u1K...p9Rr",
    },
    {
      id: "tx-5",
      date: "Oct 20, 15:10",
      merchant: "Block Burger",
      type: "redeem",
      tier: "Gold",
      amount: "-45.00 SOLC",
      positive: false,
      signature: "4h6M...s3Tt",
    },
    {
      id: "tx-6",
      date: "Oct 19, 08:22",
      merchant: "Network Protocol",
      type: "staking",
      tier: "Gold",
      amount: "+1.24 SOLC",
      positive: true,
      signature: "1x3V...y8Zz",
    },
    {
      id: "tx-7",
      date: "Oct 18, 20:05",
      merchant: "Solana Coffee",
      type: "reward",
      tier: "Silver",
      amount: "+38.50 SOLC",
      positive: true,
      signature: "7k4W...a1Bb",
    },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar variant="connected" walletAddress="8xY2...pL9n" />

      {/* Content */}
      <div className="px-12 py-10 max-w-[1200px] mx-auto">
        {/* Page Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-[1.75rem] font-bold">Reward History</h1>
          <button
            type="button"
            className="bg-transparent border border-border text-text px-4 py-2 rounded flex items-center gap-2 text-sm transition-all duration-200 hover:border-text-secondary hover:bg-white/5"
          >
            <svg
              className="w-[14px] h-[14px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Export"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-panel border border-border p-6 rounded-lg">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
              Earned this month
            </div>
            <div className="text-2xl font-semibold">2,410.50 SOLC</div>
          </div>
          <div className="bg-panel border border-border p-6 rounded-lg">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
              Redeemed this month
            </div>
            <div className="text-2xl font-semibold">850.00 SOLC</div>
          </div>
          <div className="bg-panel border border-border p-6 rounded-lg">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
              Net growth
            </div>
            <div className="text-2xl font-semibold text-accent">
              +1,560.50 SOLC
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-6 border-b border-border pb-0">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-4 text-sm font-medium relative ${activeTab === "all" ? "text-text" : "text-text-secondary"
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
              className={`pb-4 text-sm font-medium relative ${activeTab === "earned" ? "text-text" : "text-text-secondary"
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
              className={`pb-4 text-sm font-medium relative ${activeTab === "redeemed" ? "text-text" : "text-text-secondary"
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
              className={`px-3 py-1.5 rounded text-xs ${dateFilter === "7d"
                ? "bg-panel border border-border text-text"
                : "bg-transparent border border-transparent text-text-secondary"
                }`}
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => setDateFilter("30d")}
              className={`px-3 py-1.5 rounded text-xs ${dateFilter === "30d"
                ? "bg-panel border border-border text-text"
                : "bg-transparent border border-transparent text-text-secondary"
                }`}
            >
              30d
            </button>
            <button
              type="button"
              onClick={() => setDateFilter("90d")}
              className={`px-3 py-1.5 rounded text-xs ${dateFilter === "90d"
                ? "bg-panel border border-border text-text"
                : "bg-transparent border border-transparent text-text-secondary"
                }`}
            >
              90d
            </button>
            <button
              type="button"
              onClick={() => setDateFilter("all")}
              className={`px-3 py-1.5 rounded text-xs ${dateFilter === "all"
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
              {transactions.map((tx, index) => (
                <tr key={tx.id}>
                  <td
                    className={`py-5 px-6 text-sm ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    {tx.date}
                  </td>
                  <td
                    className={`py-5 px-6 text-sm ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    {tx.merchant}
                  </td>
                  <td
                    className={`py-5 px-6 text-sm ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${tx.type === "reward"
                        ? "bg-accent/10 text-accent"
                        : "bg-white/5 text-text-secondary"
                        }`}
                    >
                      {tx.type === "reward"
                        ? "Reward"
                        : tx.type === "staking"
                          ? "Staking"
                          : "Redeem"}
                    </span>
                  </td>
                  <td
                    className={`py-5 px-6 text-sm ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {tx.tier}
                    </div>
                  </td>
                  <td
                    className={`py-5 px-6 text-sm font-semibold ${tx.positive ? "text-accent" : "text-[#ff4d4d]"
                      } ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    {tx.amount}
                  </td>
                  <td
                    className={`py-5 px-6 text-sm ${index !== transactions.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <a
                      href="https://explorer.solana.com"
                      className="text-text-secondary font-mono text-xs hover:text-accent transition-colors"
                    >
                      {tx.signature}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
