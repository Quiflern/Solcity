"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCustomerAccount } from "@/hooks/customer/useCustomerAccount";
import { useTransactionHistory } from "@/hooks/customer/useTransactionHistory";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTierInfo, calculateTierProgress } from "@/lib/tiers";

export default function CustomerDashboard() {
  const { publicKey } = useWallet();
  const { customerAccount, isRegistered, isLoading } = useCustomerAccount();
  const { data: transactions = [], isLoading: txLoading } = useTransactionHistory();

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  const totalEarned = customerAccount?.totalEarned ? Number(customerAccount.totalEarned) : 0;
  const transactionCount = customerAccount?.transactionCount ? Number(customerAccount.transactionCount) : 0;
  const tier = customerAccount?.tier || { bronze: {} };

  // Get tier info from program data
  const tierInfo = getTierInfo(tier);
  const { progress: progressToNextTier, tokensNeeded } = calculateTierProgress(totalEarned, tierInfo);

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      // You can add a toast notification here
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        {/* Dashboard Layout */}
        <div className="max-w-[1400px] mx-auto px-8 w-full py-10">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading dashboard...</p>
            </div>
          ) : !isRegistered ? (
            <div className="text-center py-20">
              <div className="bg-panel border border-border rounded-xl p-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">Not Registered</h2>
                <p className="text-text-secondary mb-8">
                  You need to register with a merchant to start earning rewards.
                </p>
                <Link
                  href="/explore"
                  className="inline-block bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                >
                  Explore Merchants
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_400px] gap-8">
              {/* Main Column */}
              <main>
                {/* Balance Card */}
                <div className="relative overflow-hidden bg-linear-to-br from-[#111] to-[#050505] border border-border p-10 rounded-xl mb-8 after:content-[''] after:absolute after:-top-1/2 after:-right-[10%] after:w-[300px] after:h-[300px] after:bg-[radial-gradient(circle,rgba(208,255,20,0.05)_0%,transparent_70%)] after:pointer-events-none">
                  <div className="relative z-10">
                    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">
                      Total Earned
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[3.5rem] font-bold text-accent tracking-tight">
                        {totalEarned.toLocaleString()}
                      </span>
                      <span className="text-xl font-medium text-text-secondary">
                        SLCY
                      </span>
                    </div>

                    {/* Tier Section */}
                    <div className="mt-8 pt-8 border-t border-border">
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-accent/10 text-accent px-3 py-1 rounded text-xs font-semibold uppercase border border-accent/20">
                          {tierInfo.displayName} Tier
                        </span>
                        <span className="text-sm text-text-secondary">
                          {transactionCount} transactions
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {tierInfo.next && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-text-secondary">
                              Progress to {tierInfo.next}
                            </span>
                            <span className="text-xs text-accent font-semibold">
                              {tokensNeeded.toLocaleString()} SLCY needed
                            </span>
                          </div>
                          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent/50 to-accent rounded-full transition-all duration-500"
                              style={{ width: `${progressToNextTier}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-text-secondary">
                              {tierInfo.min.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-text-secondary">
                              {(tierInfo.max + 1).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {!tierInfo.next && (
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg border border-accent/20">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold">Max Tier Reached!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                  <div className="bg-panel border border-border p-6 rounded-lg">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Total Earned
                    </h4>
                    <p className="text-2xl font-semibold">{totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-lg">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Total Redeemed
                    </h4>
                    <p className="text-2xl font-semibold">0</p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-lg">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Current Tier
                    </h4>
                    <p className="text-2xl font-semibold">{tierInfo.displayName}</p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-lg">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Transactions
                    </h4>
                    <p className="text-2xl font-semibold">{transactionCount}</p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-panel border border-border rounded-xl p-8 mb-10 h-[320px] flex flex-col">
                  <div className="flex justify-between mb-8">
                    <h3 className="text-lg font-semibold">Balance Growth</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-text-secondary"></span>
                        <span className="text-text-secondary">Historical</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-accent">Projected (30d)</span>
                      </span>
                    </div>
                  </div>
                  <div className="grow flex items-end gap-3 pb-5 border-b border-border">
                    {/* Historical bars with gradient */}
                    {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative chart bars */}
                    {[40, 45, 42, 50, 60, 68, 75].map((height, i) => (
                      <div
                        key={`hist-${height}-${i}`}
                        className="flex-1 rounded-t-lg transition-all duration-1000"
                        style={{
                          height: `${height}%`,
                          background: 'linear-gradient(to top, #4a5a1a, #8ba832, #c0ff00)'
                        }}
                      />
                    ))}
                    {/* Projected bars with dashed pattern */}
                    {/* biome-ignore lint/suspicious/noArrayIndexKey: Static decorative projected bars */}
                    {[78, 82, 88].map((height, i) => (
                      <div
                        key={`proj-${height}-${i}`}
                        className="flex-1 rounded-t-lg border-2 border-dashed border-text-secondary/50 relative overflow-hidden"
                        style={{ height: `${height}%` }}
                      >
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
                  <div className="bg-panel border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Merchant</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {txLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-text-secondary text-sm">Loading transactions...</p>
                            </TableCell>
                          </TableRow>
                        ) : recentTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-text-secondary py-8">
                              <p className="mb-2">No transactions yet</p>
                              <p className="text-xs">Make a purchase at a merchant to earn rewards</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentTransactions.map((tx) => (
                            <TableRow key={tx.signature}>
                              <TableCell>{tx.merchant}</TableCell>
                              <TableCell>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${tx.type === "earned"
                                      ? "bg-accent/10 text-accent"
                                      : "bg-red-500/10 text-red-500"
                                    }`}
                                >
                                  {tx.type === "earned" ? "Earned" : "Redeemed"}
                                </span>
                              </TableCell>
                              <TableCell
                                className={`font-semibold ${tx.type === "earned" ? "text-accent" : "text-red-500"
                                  }`}
                              >
                                {tx.type === "earned" ? "+" : "-"}
                                {tx.amount.toLocaleString()} SLCY
                              </TableCell>
                              <TableCell className="text-text-secondary">
                                {formatDate(tx.timestamp)}
                              </TableCell>
                              <TableCell>
                                <a
                                  href={`https://explorer.solana.com/tx/${tx.signature}?cluster=custom&customUrl=http://localhost:8899`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-text-secondary text-xs flex items-center gap-1 hover:text-accent transition-colors"
                                >
                                  View Tx ↗
                                </a>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </main>

              {/* Sidebar */}
              <aside>
                <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <Link
                    href="/customer/history"
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
                      aria-label="View History"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View History
                  </Link>
                  <Link
                    href="/explore"
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
                      aria-label="Explore"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore
                  </Link>
                </div>

                {/* QR Section */}
                <div className="bg-panel border border-border p-8 rounded-xl text-center mb-8">
                  <h4 className="text-base font-semibold mb-2">Merchant Scan</h4>
                  <p className="text-sm text-text-secondary mb-6">
                    Show this to earn tokens at checkout
                  </p>
                  <div className="w-[200px] h-[200px] bg-white mx-auto mb-6 p-4 rounded-lg flex items-center justify-center">
                    {publicKey && (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicKey.toString())}`}
                        alt="Customer QR Code"
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="font-mono text-text-secondary text-xs bg-black p-2 rounded mb-4 break-all">
                    {publicKey ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : ""}
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="w-full bg-accent text-black px-10 py-4 font-semibold text-base rounded hover:bg-[#b8e612] transition-colors"
                  >
                    Copy Address
                  </button>
                </div>

                {/* Tier Info */}
                <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg border-l-[3px] border-accent mb-12">
                  <div className="text-accent text-2xl">⭐</div>
                  <div>
                    <h5 className="text-sm font-semibold">{tierInfo.displayName} Tier</h5>
                    <p className="text-xs text-text-secondary">
                      {transactionCount} transactions completed
                    </p>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-xs text-text-secondary uppercase mb-4">
                    Quick Links
                  </h4>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/explore"
                      className="p-3 border border-border rounded-lg flex justify-between items-center hover:border-accent transition-colors"
                    >
                      <span className="text-sm">Find Merchants</span>
                      <span className="text-accent text-xs">→</span>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
