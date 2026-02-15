"use client";

import { useState } from "react";

export default function MerchantAnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">(
    "30d",
  );

  const topCustomers = [
    {
      id: "customer-1",
      wallet: "8xY2...pL9n",
      earned: "4,280 SLCY",
      redeemed: "3,100 SLCY",
      tier: "Platinum",
      lastActivity: "2 hours ago",
    },
    {
      id: "customer-2",
      wallet: "KLp4...o0Pz",
      earned: "3,150 SLCY",
      redeemed: "1,200 SLCY",
      tier: "Gold",
      lastActivity: "Yesterday",
    },
    {
      id: "customer-3",
      wallet: "Am2k...9vR3",
      earned: "2,890 SLCY",
      redeemed: "850 SLCY",
      tier: "Gold",
      lastActivity: "3 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation Bar */}
      <nav className="h-[72px] border-b border-border flex items-center justify-between px-8 bg-bg sticky top-0 z-100">
        <div className="flex gap-3 items-center text-lg font-bold tracking-wider">
          <div className="w-[14px] h-[14px] bg-accent" />
          SOLCITY
          <span className="text-text-secondary font-normal ml-2 text-sm">
            MERCHANT
          </span>
        </div>
        <div className="flex gap-10">
          <a
            href="/merchant"
            className="text-accent text-sm font-medium transition-all duration-300"
          >
            Analytics
          </a>
          <a
            href="/merchant/customers"
            className="text-text-secondary text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Customers
          </a>
          <a
            href="/merchant/rules"
            className="text-text-secondary text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Rules & Tiers
          </a>
          <a
            href="/settings"
            className="text-text-secondary text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Settings
          </a>
        </div>
        <div className="flex items-center gap-3 px-4 py-1.5 bg-panel border border-border rounded-full text-sm">
          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--accent)]" />
          Coffee_Shop.sol
        </div>
      </nav>

      {/* Container */}
      <div className="max-w-[1440px] mx-auto p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <div className="flex bg-panel border border-border rounded-lg p-1">
            <button
              type="button"
              onClick={() => setDateRange("7d")}
              className={`px-4 py-2 text-xs font-semibold rounded-md ${dateRange === "7d"
                ? "bg-border text-text"
                : "bg-transparent text-text-secondary"
                }`}
            >
              7D
            </button>
            <button
              type="button"
              onClick={() => setDateRange("30d")}
              className={`px-4 py-2 text-xs font-semibold rounded-md ${dateRange === "30d"
                ? "bg-border text-text"
                : "bg-transparent text-text-secondary"
                }`}
            >
              30D
            </button>
            <button
              type="button"
              onClick={() => setDateRange("90d")}
              className={`px-4 py-2 text-xs font-semibold rounded-md ${dateRange === "90d"
                ? "bg-border text-text"
                : "bg-transparent text-text-secondary"
                }`}
            >
              90D
            </button>
            <button
              type="button"
              onClick={() => setDateRange("custom")}
              className={`px-4 py-2 text-xs font-semibold rounded-md ${dateRange === "custom"
                ? "bg-border text-text"
                : "bg-transparent text-text-secondary"
                }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-panel border border-border p-6 rounded-xl">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
              Avg Reward / Tx
            </div>
            <div className="text-2xl font-semibold">12.4 SLCY</div>
          </div>
          <div className="bg-panel border border-border p-6 rounded-xl">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
              Redemption Rate
            </div>
            <div className="text-2xl font-semibold">33.2%</div>
          </div>
          <div className="bg-panel border border-border p-6 rounded-xl">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
              Retention Rate
            </div>
            <div className="text-2xl font-semibold">68.5%</div>
          </div>
          <div className="bg-panel border border-border p-6 rounded-xl">
            <div className="text-[0.7rem] uppercase text-text-secondary mb-2 tracking-wider">
              New Customers
            </div>
            <div className="text-2xl font-semibold">+142</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-[2fr_1fr] gap-6 mb-6">
          {/* Issuance & Redemption Volume */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-sm font-semibold mb-6">
              Issuance & Redemption Volume
            </div>
            <div className="h-[200px] flex items-end gap-2 pb-2.5 border-b border-border">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative chart bars */}
              {[40, 15, 55, 20, 45, 12, 70, 35, 85, 40, 60, 25].map(
                (height, i) => (
                  <div
                    key={`bar-${i}`}
                    className={`flex-1 rounded-t-sm ${i % 2 === 0
                      ? "bg-linear-to-t from-accent/[0.02] to-accent/20"
                      : "bg-linear-to-t from-white/[0.02] to-white/10"
                      }`}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
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
            <div className="text-sm font-semibold mb-6">Tier Distribution</div>
            <div className="flex items-center justify-center relative h-[200px]">
              <div className="w-[140px] h-[140px] rounded-full border-[15px] border-border border-t-accent border-r-[#A3C910] rotate-45" />
              <div className="absolute text-center">
                <div className="text-xl font-bold">1,429</div>
                <div className="text-[0.6rem] text-text-secondary">TOTAL</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-sm bg-accent/10 border border-accent" />
                Plat (12%)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-sm bg-[#FFD700]/10 border border-[#FFD700]" />
                Gold (24%)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-sm bg-[#C0C0C0]/10 border border-[#C0C0C0]" />
                Silver (31%)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-sm bg-[#CD7F32]/10 border border-[#CD7F32]" />
                Bronze (33%)
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Customer Growth */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-sm font-semibold mb-6">Customer Growth</div>
            <div className="h-[140px]">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
                role="img"
                aria-label="Customer growth chart"
              >
                <title>Customer Growth Chart</title>
                <path
                  d="M0,80 Q50,70 100,60 T200,40 T300,20 T400,10"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* Redemption Breakdown */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-sm font-semibold mb-6">
              Redemption Breakdown
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs">
                <span>Free Americano</span>
                <span className="text-accent">45%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="w-[45%] h-full bg-accent" />
              </div>
              <div className="flex justify-between text-xs">
                <span>10% Store Discount</span>
                <span className="text-accent">32%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="w-[32%] h-full bg-accent" />
              </div>
              <div className="flex justify-between text-xs">
                <span>Pastry Combo</span>
                <span className="text-accent">23%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="w-[23%] h-full bg-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Customers */}
        <div className="mt-4">
          <h3 className="text-lg mb-6">Top Performing Customers</h3>
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
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
                {topCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="py-5 px-6 border-b border-border text-sm">
                      <code>{customer.wallet}</code>
                    </td>
                    <td className="py-5 px-6 border-b border-border text-sm">
                      {customer.earned}
                    </td>
                    <td className="py-5 px-6 border-b border-border text-sm">
                      {customer.redeemed}
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
                      {customer.lastActivity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
