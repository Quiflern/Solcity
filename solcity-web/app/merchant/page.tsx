"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMerchantAccount } from "@/hooks/useMerchantAccount";
import { useMerchantRewardRules } from "@/hooks/useMerchantRewardRules";
import { useIssueRewards } from "@/hooks/useIssueRewards";
import { toast } from "sonner";
import { getMerchantPDA, getLoyaltyProgramPDA } from "@/lib/anchor/pdas";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MerchantDashboard() {
  const { publicKey } = useWallet();
  const { merchantAccount, isLoading: merchantLoading, isRegistered } = useMerchantAccount();
  const { issueRewards, isLoading: issuingRewards } = useIssueRewards();
  const queryClient = useQueryClient();

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [customerWallet, setCustomerWallet] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");

  // Get merchant PDA for fetching rules
  const merchantPDA = publicKey ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0] : null;
  const { data: rules = [], isLoading: rulesLoading } = useMerchantRewardRules(merchantPDA);

  // Get active rules count
  const activeRulesCount = rules.filter(rule => rule.isActive).length;

  // Calculate base reward (merchant's reward rate)
  const rewardRate = merchantAccount ? Number(merchantAccount.rewardRate) / 100 : 1.0;
  const baseReward = purchaseAmount ? parseFloat(purchaseAmount) * rewardRate : 0;

  // For now, we'll use a simple 1.0x multiplier (tier multipliers are applied on-chain)
  const multiplier = 1.0;
  const estimatedIssuance = baseReward * multiplier;

  // Chart data - mock data for now, will be replaced with real transaction history
  const chartData = [
    { week: "Week 1", issued: 3500 },
    { week: "Week 2", issued: 4800 },
    { week: "Week 3", issued: 4200 },
    { week: "Week 4", issued: 6500 },
    { week: "Week 5", issued: 5200 },
    { week: "Week 6", issued: 7800 },
    { week: "Week 7", issued: 9200 },
    { week: "Week 8", issued: 8500 },
    { week: "Week 9", issued: 7000 },
    { week: "Week 10", issued: 9500 },
    { week: "Week 11", issued: 8200 },
    { week: "Week 12", issued: 8800 },
  ];

  const handleIssueRewards = async () => {
    if (!customerWallet || !purchaseAmount) {
      toast.error("Missing Information", {
        description: "Please enter both customer wallet and purchase amount",
      });
      return;
    }

    try {
      // Validate wallet address
      const customerPubkey = new PublicKey(customerWallet);
      const amount = parseFloat(purchaseAmount);

      if (amount <= 0) {
        toast.error("Invalid Amount", {
          description: "Purchase amount must be greater than 0",
        });
        return;
      }

      toast.loading("Issuing rewards...", { id: "issue-rewards" });

      await issueRewards(customerPubkey, amount);

      toast.success("Rewards Issued!", {
        id: "issue-rewards",
        description: `Successfully issued ${estimatedIssuance.toFixed(2)} SLCY tokens`,
      });

      // Invalidate merchant account query to refresh stats
      queryClient.invalidateQueries({ queryKey: ["merchant", publicKey?.toString()] });

      // Clear form
      setCustomerWallet("");
      setPurchaseAmount("");
    } catch (err: any) {
      console.error("Issue rewards error:", err);

      let errorTitle = "Failed to Issue Rewards";
      let errorDescription = "An unexpected error occurred";

      if (err.message?.includes("insufficient")) {
        errorTitle = "Insufficient Balance";
        errorDescription = "Not enough SOL to complete the transaction";
      } else if (err.message?.includes("User rejected")) {
        errorTitle = "Transaction Cancelled";
        errorDescription = "You cancelled the transaction";
      } else if (err.message?.includes("Invalid public key")) {
        errorTitle = "Invalid Wallet Address";
        errorDescription = "Please enter a valid Solana wallet address";
      } else if (err.message) {
        errorDescription = err.message;
      }

      toast.error(errorTitle, {
        id: "issue-rewards",
        description: errorDescription,
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
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


        {/* Dashboard Layout */}
        <div className="max-w-[1400px] mx-auto px-8 w-full py-10">
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
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-3">No Merchant Account Found</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  You need to register as a merchant before you can access the dashboard. Register your business to get started with your loyalty program.
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
            <div className="grid grid-cols-[1fr_400px] gap-8">
              {/* Main Column */}
              <main>
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Reward Rate
                    </h4>
                    <p className="text-2xl font-semibold">{rewardRate.toFixed(2)} SLCY/$</p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Tokens Issued
                    </h4>
                    <p className="text-2xl font-semibold">
                      {merchantAccount.totalIssued ? Number(merchantAccount.totalIssued).toLocaleString() : "0"}
                    </p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Tokens Redeemed
                    </h4>
                    <p className="text-2xl font-semibold">
                      {merchantAccount.totalRedeemed ? Number(merchantAccount.totalRedeemed).toLocaleString() : "0"}
                    </p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Active Rules
                    </h4>
                    <p className="text-2xl font-semibold">{activeRulesCount}</p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-panel border border-border rounded-xl p-8 mb-10">
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold">Issuance Trend</h3>
                    <div className="flex gap-4 text-xs">
                      <span className="text-text-secondary">Weekly SLCY Issued</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#c0ff00" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#c0ff00" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="#888"
                        style={{ fontSize: '0.7rem' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#888"
                        style={{ fontSize: '0.7rem' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.875rem'
                        }}
                        cursor={{ fill: 'rgba(192, 255, 0, 0.05)' }}
                      />
                      <Bar
                        dataKey="issued"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Issuance Feed */}
                <div>
                  <h3 className="text-lg mb-6">Recent Issuance Feed</h3>
                  <div className="bg-panel border border-border rounded-xl p-8 text-center">
                    <p className="text-text-secondary text-sm">
                      Transaction history coming soon
                    </p>
                    <p className="text-text-secondary text-xs mt-2">
                      Issue rewards to see them appear here
                    </p>
                  </div>
                </div>
              </main>

              {/* Sidebar */}
              <aside>
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
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="bg-black border border-dashed border-border rounded-lg p-5 mb-6">
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>Base Reward ({rewardRate.toFixed(2)} SLCY/$)</span>
                      <span>{baseReward.toFixed(2)} SLCY</span>
                    </div>
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>Customer Tier Multiplier</span>
                      <span>Applied on-chain</span>
                    </div>
                    <div className="flex justify-between text-sm text-text font-semibold mt-3 pt-3 border-t border-border">
                      <span>Estimated Issuance</span>
                      <span className="text-accent">
                        ~{estimatedIssuance.toFixed(2)} SLCY
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleIssueRewards}
                    disabled={issuingRewards || !customerWallet || !purchaseAmount}
                    className="bg-accent text-black px-4 py-4 border-none font-bold text-base cursor-pointer rounded-lg w-full transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {issuingRewards ? "Processing..." : "Confirm & Issue Reward"}
                  </button>

                  <p className="text-[0.7rem] text-text-secondary text-center mt-4">
                    Transactions are finalized on Solana.
                    <br />
                    Customer tier multipliers applied automatically.
                  </p>
                </div>

                {/* Quick Rule Management */}
                <div className="mt-10 p-6 border border-border rounded-xl">
                  <h4 className="text-[0.75rem] text-text-secondary uppercase mb-4">
                    Quick Rule Management
                  </h4>
                  {rulesLoading ? (
                    <p className="text-sm text-text-secondary">Loading rules...</p>
                  ) : rules.length === 0 ? (
                    <p className="text-sm text-text-secondary">No rules created yet</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {rules.slice(0, 3).map((rule) => (
                        <div key={rule.publicKey.toString()} className="flex justify-between items-center">
                          <span className="text-sm">{rule.name}</span>
                          <span className={`text-xs ${rule.isActive ? "text-accent" : "text-text-secondary"}`}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/merchant/rules">
                    <button
                      type="button"
                      className="w-full mt-6 bg-transparent border border-border text-text px-4 py-2.5 rounded-md text-xs cursor-pointer hover:border-accent hover:text-accent transition-colors"
                    >
                      Edit All Rules
                    </button>
                  </Link>
                </div>
              </aside>
            </div>
          ) : null}
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
    </ProtectedRoute>
  );
}
