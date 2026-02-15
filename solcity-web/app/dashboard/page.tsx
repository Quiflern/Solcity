"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWalletInfo } from "@/hooks/useWalletInfo";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerDashboard() {
  const { shortAddress } = useWalletInfo();
  const [tokenBalance, setTokenBalance] = useState(12450.75);

  // Simulate growing balance with APY
  useEffect(() => {
    const apy = 3.8;
    const incrementPerSecond = (tokenBalance * apy) / 100 / 31536000;

    const interval = setInterval(() => {
      setTokenBalance((prev) => prev + incrementPerSecond);
    }, 100);

    return () => clearInterval(interval);
  }, [tokenBalance]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Navbar />

        {/* Dashboard Layout */}
        <div className="grid grid-cols-[1fr_400px] gap-px bg-border min-h-[calc(100vh-72px)]">
          {/* Main Column */}
          <main className="bg-bg-primary p-10">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-linear-to-br from-[#111] to-[#050505] border border-border p-10 rounded-xl mb-8 after:content-[''] after:absolute after:-top-1/2 after:-right-[10%] after:w-[300px] after:h-[300px] after:bg-[radial-gradient(circle,rgba(208,255,20,0.05)_0%,transparent_70%)] after:pointer-events-none">
              <div className="relative z-10">
                <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">
                  Active Balance
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[3.5rem] font-bold text-accent tracking-tight">
                    {tokenBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xl font-medium text-text-secondary">
                    SOLC
                  </span>
                </div>

                {/* Tier Section */}
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded text-xs font-semibold uppercase border border-accent/20">
                      Platinum Tier
                    </span>
                    <span className="text-sm text-text-secondary">
                      Earn +3.8% APY
                    </span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-accent w-[72%] shadow-[0_0_15px_#d0ff14]" />
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>12,450 / 15,000 to Elite</span>
                    <span>Top 2% of users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-10">
              <div className="bg-panel border border-border p-6 rounded-lg">
                <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                  Total Earned
                </h4>
                <p className="text-2xl font-semibold">18,241</p>
              </div>
              <div className="bg-panel border border-border p-6 rounded-lg">
                <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                  Total Redeemed
                </h4>
                <p className="text-2xl font-semibold">5,790</p>
              </div>
              <div className="bg-panel border border-border p-6 rounded-lg">
                <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                  Current Streak
                </h4>
                <p className="text-2xl font-semibold">14 Days</p>
              </div>
              <div className="bg-panel border border-border p-6 rounded-lg">
                <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                  Transactions
                </h4>
                <p className="text-2xl font-semibold">128</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-panel border border-border rounded-xl p-8 mb-10 h-[320px] flex flex-col">
              <div className="flex justify-between mb-8">
                <h3 className="text-xl font-semibold">Balance Growth</h3>
                <div className="flex gap-4 text-sm">
                  <span className="text-text-secondary">● Historical</span>
                  <span className="text-accent">● Projected (30d)</span>
                </div>
              </div>
              <div className="grow flex items-end gap-3 pb-5 border-b border-border">
                {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative chart bars */}
                {[40, 45, 42, 50, 60, 68, 75].map((height, i) => (
                  <div
                    key={`hist-${height}-${i}`}
                    className="flex-1 bg-linear-to-t from-accent/10 to-accent/40 rounded-t transition-all duration-1000"
                    style={{ height: `${height}%` }}
                  />
                ))}
                {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative projected bars */}
                {[78, 82, 88].map((height, i) => (
                  <div
                    key={`proj-${height}-${i}`}
                    className="flex-1 bg-[repeating-linear-gradient(45deg,#111,#111_5px,#222_5px,#222_10px)] border border-dashed border-text-secondary opacity-50 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs uppercase text-text-secondary p-4">
                      Merchant
                    </th>
                    <th className="text-left text-xs uppercase text-text-secondary p-4">
                      Type
                    </th>
                    <th className="text-left text-xs uppercase text-text-secondary p-4">
                      Amount
                    </th>
                    <th className="text-left text-xs uppercase text-text-secondary p-4">
                      Date
                    </th>
                    <th className="text-left text-xs uppercase text-text-secondary p-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "tx-1",
                      merchant: "Solana Coffee",
                      type: "Reward",
                      amount: "+45.00",
                      date: "Oct 24, 14:20",
                      positive: true,
                    },
                    {
                      id: "tx-2",
                      merchant: "Elite Fitness",
                      type: "Redeem",
                      amount: "-150.00",
                      date: "Oct 23, 09:15",
                      positive: false,
                    },
                    {
                      id: "tx-3",
                      merchant: "Network Interest",
                      type: "Staking",
                      amount: "+1.24",
                      date: "Oct 22, 00:00",
                      positive: true,
                    },
                    {
                      id: "tx-4",
                      merchant: "The Solana Store",
                      type: "Reward",
                      amount: "+210.50",
                      date: "Oct 21, 18:42",
                      positive: true,
                    },
                  ].map((tx) => (
                    <tr key={tx.id} className="border-b border-border">
                      <td className="p-5 text-sm">{tx.merchant}</td>
                      <td className="p-5 text-sm">{tx.type}</td>
                      <td
                        className={`p-5 text-sm font-semibold ${tx.positive ? "text-accent" : "text-[#ff4d4d]"}`}
                      >
                        {tx.amount}
                      </td>
                      <td className="p-5 text-sm">{tx.date}</td>
                      <td className="p-5">
                        <a
                          href="https://explorer.solana.com"
                          className="text-text-secondary text-xs flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          View Tx ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="bg-bg-primary p-10 border-l border-border">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button
                type="button"
                className="p-4 rounded-lg border border-border bg-panel text-text-primary font-semibold cursor-pointer transition-all hover:border-accent hover:bg-accent/5 flex flex-col items-center gap-2 text-sm"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="View Rewards"
                >
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                View Rewards
              </button>
              <button
                type="button"
                className="p-4 rounded-lg border border-border bg-panel text-text-primary font-semibold cursor-pointer transition-all hover:border-accent hover:bg-accent/5 flex flex-col items-center gap-2 text-sm"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Redeem"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Redeem
              </button>
            </div>

            {/* QR Section */}
            <div className="bg-panel border border-border p-8 rounded-xl text-center mb-8">
              <h4 className="text-base font-semibold mb-2">Merchant Scan</h4>
              <p className="text-sm text-text-secondary mb-6">
                Show this to earn tokens at checkout
              </p>
              <div className="w-[200px] h-[200px] bg-white mx-auto mb-6 p-4 rounded-lg flex items-center justify-center">
                <div className="w-full h-full grid grid-cols-10 grid-rows-10 gap-px">
                  {/* QR Code Pattern */}
                  {/* biome-ignore lint/suspicious/noArrayIndexKey: Static QR code pattern */}
                  {Array.from({ length: 100 }).map((_, i) => {
                    const isBlack = [
                      0, 1, 2, 3, 10, 13, 20, 23, 30, 31, 32, 33, 60, 61, 62, 63,
                      70, 73, 80, 83, 90, 91, 92, 93, 6, 7, 8, 9, 16, 19, 26, 29,
                      36, 37, 38, 39, 66, 69, 76, 79, 86, 89, 96, 97, 98, 99, 44,
                      45, 54, 55, 64, 65, 74, 75, 84, 85, 94, 95,
                    ].includes(i);
                    return (
                      <div
                        key={`qr-${i}`}
                        className={isBlack ? "bg-black" : "bg-white"}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="font-mono text-text-secondary text-sm bg-black p-2 rounded mb-4 break-all">
                8xY2...pL9n_solana_v1
              </div>
              <button
                type="button"
                className="w-full bg-accent text-black px-10 py-4 font-semibold text-base rounded hover:bg-[#b8e612] transition-colors"
              >
                Copy Address
              </button>
            </div>

            {/* Streak Info */}
            <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg border-l-[3px] border-accent mb-12">
              <div className="text-accent text-2xl">🔥</div>
              <div>
                <h5 className="text-sm font-semibold">14-Day Streak!</h5>
                <p className="text-xs text-text-secondary">
                  You're earning +0.5% bonus APY.
                </p>
              </div>
            </div>

            {/* Nearby Partners */}
            <div>
              <h4 className="text-xs text-text-secondary uppercase mb-4">
                Nearby Partners
              </h4>
              <div className="flex flex-col gap-3">
                <div className="p-3 border border-border rounded-lg flex justify-between items-center">
                  <span className="text-sm">Block Burger</span>
                  <span className="text-accent text-xs">0.4 mi</span>
                </div>
                <div className="p-3 border border-border rounded-lg flex justify-between items-center">
                  <span className="text-sm">Cyber Cafe</span>
                  <span className="text-accent text-xs">1.2 mi</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
