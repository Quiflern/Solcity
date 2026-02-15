"use client";

import { useState } from "react";

export default function MerchantDashboard() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [customerWallet, setCustomerWallet] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");

  const baseReward = purchaseAmount ? parseFloat(purchaseAmount) * 1.0 : 0;
  const multiplier = customerWallet ? 1.2 : 0;
  const estimatedIssuance = baseReward * (multiplier || 1);

  const recentIssuances = [
    {
      id: "issue-1",
      customer: "8xY2...pL9n",
      amountUSD: "$14.50",
      reward: "+17.40",
      multiplier: "1.2x Platinum",
      multiplierStyle: "platinum",
      timestamp: "Just now",
    },
    {
      id: "issue-2",
      customer: "Am2k...9vR3",
      amountUSD: "$8.00",
      reward: "+8.00",
      multiplier: "1.0x Base",
      multiplierStyle: "base",
      timestamp: "12 mins ago",
    },
    {
      id: "issue-3",
      customer: "KLp4...o0Pz",
      amountUSD: "$22.00",
      reward: "+33.00",
      multiplier: "1.5x Elite",
      multiplierStyle: "elite",
      timestamp: "45 mins ago",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* QR Scanner Overlay */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/90 z-1000 flex items-center justify-center flex-col">
          <div className="w-[300px] h-[300px] border-2 border-accent rounded-[20px] relative overflow-hidden bg-panel">
            <div className="w-full h-[2px] bg-accent absolute top-0 shadow-[0_0_15px_var(--accent)] animate-scan" />
          </div>
          <p className="mt-8 font-semibold">Scan Customer Wallet QR</p>
          <button
            type="button"
            onClick={() => setShowQRScanner(false)}
            className="mt-4 bg-transparent border border-border text-text px-5 py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

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

      {/* Dashboard Layout */}
      <div className="grid grid-cols-[1fr_400px] min-h-[calc(100vh-72px)]">
        {/* Main Column */}
        <main className="bg-bg p-10 border-r border-border">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-panel border border-border p-6 rounded-xl">
              <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                Total Customers
              </h4>
              <p className="text-2xl font-semibold">1,429</p>
            </div>
            <div className="bg-panel border border-border p-6 rounded-xl">
              <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                Tokens Issued
              </h4>
              <p className="text-2xl font-semibold">248.5k</p>
            </div>
            <div className="bg-panel border border-border p-6 rounded-xl">
              <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                Tokens Redeemed
              </h4>
              <p className="text-2xl font-semibold">82.1k</p>
            </div>
            <div className="bg-panel border border-border p-6 rounded-xl">
              <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                Active Rules
              </h4>
              <p className="text-2xl font-semibold">4</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-panel border border-border rounded-xl p-8 mb-10 h-[300px] flex flex-col">
            <div className="flex justify-between mb-8">
              <h3 className="text-lg font-semibold">Issuance Trend</h3>
              <div className="flex gap-4 text-xs">
                <span className="text-text-secondary">Weekly SLCY Issued</span>
              </div>
            </div>
            <div className="grow flex items-end gap-3 pb-2.5 border-b border-border">
              {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative chart bars */}
              {[35, 48, 42, 65, 52, 78, 92, 85, 70, 95, 82, 88].map(
                (height, i) => (
                  <div
                    key={`chart-${i}`}
                    className="flex-1 bg-linear-to-t from-accent/5 to-accent/30 rounded-t min-h-[20px]"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>

          {/* Recent Issuance Feed */}
          <div>
            <h3 className="text-lg mb-6">Recent Issuance Feed</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Customer
                  </th>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Amount (USD)
                  </th>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Reward (SLCY)
                  </th>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Multiplier
                  </th>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Timestamp
                  </th>
                  <th className="text-left text-[0.7rem] uppercase text-text-secondary p-4 border-b border-border">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentIssuances.map((issue) => (
                  <tr key={issue.id}>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <code>{issue.customer}</code>
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      {issue.amountUSD}
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm font-semibold text-accent">
                      {issue.reward}
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <span
                        className={`text-[0.7rem] px-2 py-0.5 rounded uppercase font-semibold ${
                          issue.multiplierStyle === "platinum"
                            ? "bg-accent/10 text-accent"
                            : issue.multiplierStyle === "elite"
                              ? "bg-accent/10 text-accent border border-accent"
                              : "bg-[#222] text-[#888]"
                        }`}
                      >
                        {issue.multiplier}
                      </span>
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      {issue.timestamp}
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <a
                        href="https://explorer.solana.com"
                        className="text-text-secondary text-xs"
                      >
                        Confirmed ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="bg-bg p-10">
          {/* Issue Rewards Panel */}
          <div className="bg-panel border border-border p-8 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Issue Rewards</h3>
              <svg
                width="20"
                height="20"
                fill="var(--accent)"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Info"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>

            <div className="mb-6">
              <label
                htmlFor="customer-wallet"
                className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
              >
                Customer Wallet
              </label>
              <div className="flex gap-2">
                <input
                  id="customer-wallet"
                  type="text"
                  value={customerWallet}
                  onChange={(e) => setCustomerWallet(e.target.value)}
                  className="flex-1 bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                  placeholder="Paste address or .sol domain"
                />
                <button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="bg-border border-none text-text w-[46px] rounded-lg cursor-pointer flex items-center justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Scan QR"
                  >
                    <path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    <path d="M7 12h10M12 7v10" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="purchase-amount"
                className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
              >
                Purchase Amount (USD)
              </label>
              <input
                id="purchase-amount"
                type="number"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                placeholder="0.00"
              />
            </div>

            <div className="bg-black border border-dashed border-border rounded-lg p-5 mb-6">
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Base Reward (1.0 SLCY/$)</span>
                <span>{baseReward.toFixed(2)} SLCY</span>
              </div>
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Customer Tier Multiplier</span>
                <span>{customerWallet ? "1.2x" : "--"}</span>
              </div>
              <div className="flex justify-between text-sm text-text font-semibold mt-3 pt-3 border-t border-border">
                <span>Estimated Issuance</span>
                <span className="text-accent">
                  {estimatedIssuance.toFixed(2)} SLCY
                </span>
              </div>
            </div>

            <button
              type="button"
              className="bg-accent text-black px-4 py-4 border-none font-bold text-base cursor-pointer rounded-lg w-full transition-transform active:scale-[0.99]"
            >
              Confirm & Issue Reward
            </button>

            <p className="text-[0.7rem] text-text-secondary text-center mt-4">
              Transactions are finalized on Solana Mainnet.
              <br />
              Gas fees covered by Merchant Pool.
            </p>
          </div>

          {/* Quick Rule Management */}
          <div className="mt-10 p-6 border border-border rounded-xl">
            <h4 className="text-[0.75rem] text-text-secondary uppercase mb-4">
              Quick Rule Management
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base Rate: 1.0 / $</span>
                <span className="text-accent text-xs">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Happy Hour (2x)</span>
                <span className="text-text-secondary text-xs">Scheduled</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full mt-6 bg-transparent border border-border text-text px-4 py-2.5 rounded-md text-xs cursor-pointer"
            >
              Edit All Rules
            </button>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
