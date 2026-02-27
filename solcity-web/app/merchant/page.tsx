"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import { useIssueRewards } from "@/hooks/merchant/useIssueRewards";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { useMerchantCustomerRecords } from "@/hooks/merchant/useMerchantCustomerRecords";
import { useMerchantTransactionRecords } from "@/hooks/merchant/useMerchantTransactionRecords";
import { useMerchantRewardRules } from "@/hooks/merchant/useMerchantRewardRules";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { getTierInfo } from "@/lib/tiers";
import { useSolcityProgram } from "@/hooks/program/useSolcityProgram";

/**
 * Merchant Dashboard Page
 *
 * Central hub for merchants to manage their loyalty program and issue rewards.
 *
 * Features:
 * - Real-time statistics (reward rate, tokens issued/redeemed, active rules)
 * - Weekly issuance trend chart
 * - Recent transaction feed with customer details
 * - Reward issuance panel with:
 *   - Customer wallet input
 *   - Purchase amount entry
 *   - Optional reward rule selection
 *   - Estimated reward calculation (base + rule multiplier + tier bonus)
 * - Quick rule management sidebar
 *
 * The dashboard provides merchants with a complete overview of their loyalty
 * program performance and tools to reward customers in real-time.
 *
 * @returns Merchant dashboard with stats, charts, and reward issuance interface
 */
export default function MerchantDashboard() {
  const { publicKey } = useWallet();
  const {
    merchantAccount,
    isLoading: merchantLoading,
    isRegistered,
  } = useMerchantAccount();
  const { issueRewards, isLoading: issuingRewards } = useIssueRewards();
  const { program } = useSolcityProgram();

  const [customerWallet, setCustomerWallet] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [customerTierInfo, setCustomerTierInfo] = useState<{
    tierName: string;
    multiplier: number;
  } | null>(null);
  const [fetchingTier, setFetchingTier] = useState(false);

  // Get merchant PDA for fetching rules and customer records
  const merchantPDA = publicKey
    ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
    : null;
  const { data: rules = [], isLoading: rulesLoading } =
    useMerchantRewardRules(merchantPDA);
  const { data: transactionRecords = [], isLoading: transactionsLoading } =
    useMerchantTransactionRecords(merchantPDA);
  const { data: customerRecords = [], isLoading: recordsLoading } =
    useMerchantCustomerRecords(merchantPDA);

  // Get active rules count
  const activeRulesCount = rules.filter((rule) => rule.isActive).length;

  // Calculate totals from customer records (faster and more accurate)
  const totalIssued = customerRecords.reduce((sum, record) => sum + record.totalIssued, 0);
  const totalRedeemed = customerRecords.reduce((sum, record) => sum + record.totalRedeemed, 0);
  const activeCustomers = customerRecords.length;

  // Get selected rule details
  const selectedRule =
    selectedRuleId !== null
      ? rules.find((r) => r.ruleId === selectedRuleId)
      : null;

  /**
   * Fetch customer tier information when wallet address changes
   */
  useEffect(() => {
    const fetchCustomerTier = async () => {
      if (!customerWallet || !program) {
        setCustomerTierInfo(null);
        return;
      }

      try {
        const customerPubkey = new PublicKey(customerWallet);
        setFetchingTier(true);

        // Query customer account
        const accounts = await program.account.customer.all([
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: customerPubkey.toBase58(),
            },
          },
        ]);

        if (accounts.length > 0) {
          const customerAccount = accounts[0].account;
          const tierInfo = getTierInfo(customerAccount.tier);
          setCustomerTierInfo({
            tierName: tierInfo.displayName,
            multiplier: tierInfo.multiplier,
          });
        } else {
          setCustomerTierInfo(null);
        }
      } catch (err) {
        // Invalid wallet address or not found
        setCustomerTierInfo(null);
      } finally {
        setFetchingTier(false);
      }
    };

    // Debounce the fetch to avoid too many requests
    const timeoutId = setTimeout(fetchCustomerTier, 500);
    return () => clearTimeout(timeoutId);
  }, [customerWallet, program]);

  /**
   * Calculate base reward using merchant's reward rate
   * Base reward = purchase amount × reward rate (SLCY per dollar)
   */
  const rewardRate = merchantAccount
    ? Number(merchantAccount.rewardRate) / 100
    : 1.0;
  const baseReward = purchaseAmount
    ? parseFloat(purchaseAmount) * rewardRate
    : 0;

  /**
   * Calculate estimated issuance with rule multiplier and customer tier
   * Final estimate = base reward × rule multiplier × tier multiplier
   */
  let estimatedIssuance = baseReward;
  let ruleMultiplier = 1.0;

  if (selectedRule && purchaseAmount) {
    const purchaseAmountNum = parseFloat(purchaseAmount);
    const minPurchaseDollars = selectedRule.minPurchase / 100; // Convert cents to dollars
    // Check if purchase meets minimum requirement
    if (purchaseAmountNum >= minPurchaseDollars) {
      ruleMultiplier = selectedRule.multiplier / 100; // Convert from basis points
      estimatedIssuance = baseReward * ruleMultiplier;
    }
  }

  // Apply customer tier multiplier if available
  if (customerTierInfo) {
    estimatedIssuance = estimatedIssuance * customerTierInfo.multiplier;
  }

  /**
   * Generate chart data from customer records
   * Shows issued vs redeemed comparison
   */
  const getChartData = () => {
    if (customerRecords.length === 0) {
      return [
        { category: "Issued", amount: 0 },
        { category: "Redeemed", amount: 0 },
      ];
    }

    const totalIssued = customerRecords.reduce((sum, record) => sum + record.totalIssued, 0);
    const totalRedeemed = customerRecords.reduce((sum, record) => sum + record.totalRedeemed, 0);

    return [
      { category: "Issued", amount: totalIssued },
      { category: "Redeemed", amount: totalRedeemed },
    ];
  };

  const chartData = getChartData();

  /**
   * Handles reward issuance to a customer
   * Validates inputs, calculates rewards, and submits transaction to blockchain
   */
  const handleIssueRewards = async () => {
    if (!customerWallet || !purchaseAmount) {
      toast.error("Missing Information", {
        description: "Please enter both customer wallet and purchase amount",
        duration: 4000,
      });
      return;
    }

    let loadingToastId: string | number | undefined;

    try {
      // Validate wallet address
      let customerPubkey: PublicKey;
      try {
        customerPubkey = new PublicKey(customerWallet);
      } catch {
        toast.error("Invalid Wallet Address", {
          description:
            "Please enter a valid Solana wallet address (base58 format)",
          duration: 4000,
        });
        return;
      }

      const amount = parseFloat(purchaseAmount);

      if (amount <= 0) {
        toast.error("Invalid Amount", {
          description: "Purchase amount must be greater than 0",
          duration: 4000,
        });
        return;
      }

      if (Number.isNaN(amount)) {
        toast.error("Invalid Amount", {
          description: "Please enter a valid number",
          duration: 4000,
        });
        return;
      }

      loadingToastId = toast.loading("Issuing rewards...");

      await issueRewards(customerPubkey, amount, selectedRuleId ?? undefined);

      const tierText = customerTierInfo
        ? ` (${customerTierInfo.tierName} tier: ${customerTierInfo.multiplier}x)`
        : "";

      toast.success("Rewards Issued!", {
        id: loadingToastId,
        description: `Successfully issued ~${estimatedIssuance.toFixed(2)} SLCY tokens${tierText}`,
        duration: 4000,
      });

      // Clear form
      setCustomerWallet("");
      setPurchaseAmount("");
      setSelectedRuleId(null);
      setCustomerTierInfo(null);
    } catch (err: unknown) {
      // Dismiss loading toast if it exists
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }

      let errorTitle = "Failed to Issue Rewards";
      let errorDescription = "An unexpected error occurred";

      const errorMessage = err instanceof Error ? err.message : "";

      if (errorMessage.includes("insufficient")) {
        errorTitle = "Insufficient Balance";
        errorDescription = "Not enough SOL to complete the transaction";
      } else if (errorMessage.includes("User rejected")) {
        errorTitle = "Transaction Cancelled";
        errorDescription = "You cancelled the transaction";
      } else if (errorMessage.includes("Invalid public key")) {
        errorTitle = "Invalid Wallet Address";
        errorDescription = "Please enter a valid Solana wallet address";
      } else if (errorMessage.includes("Customer not registered")) {
        errorTitle = "Customer Not Registered";
        errorDescription =
          "This customer hasn't registered yet. They need to visit your merchant page and click 'Register to Earn Rewards' first.";
      } else if (
        errorMessage.includes("AccountNotInitialized") ||
        errorMessage.includes("Account does not exist")
      ) {
        errorTitle = "Customer Not Found";
        errorDescription =
          "This customer hasn't registered in the loyalty program yet.";
      } else if (errorMessage) {
        errorDescription = errorMessage;
      }

      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000,
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
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
                    <title>Alert</title>
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
                  You need to register as a merchant before you can access the
                  dashboard. Register your business to get started with your
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
            <div className="grid grid-cols-[1fr_400px] gap-8">
              {/* Main Column */}
              <main>
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Reward Rate
                    </h4>
                    <p className="text-2xl font-semibold text-accent">
                      {rewardRate.toFixed(2)} SLCY/$
                    </p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Tokens Issued
                    </h4>
                    <p className="text-2xl font-semibold text-accent">
                      {totalIssued.toLocaleString()}{" "}
                      <span className="text-text">SLCY</span>
                    </p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Tokens Redeemed
                    </h4>
                    <p className="text-2xl font-semibold text-accent">
                      {totalRedeemed.toLocaleString()}{" "}
                      <span className="text-text">SLCY</span>
                    </p>
                  </div>
                  <div className="bg-panel border border-border p-6 rounded-xl">
                    <h4 className="text-[0.7rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Active Customers
                    </h4>
                    <p className="text-2xl font-semibold text-accent">{activeCustomers}</p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-panel border border-border rounded-xl p-8 mb-10">
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold">Token Overview</h3>
                    <div className="flex gap-4 text-xs">
                      <span className="text-text-secondary">
                        Issued vs Redeemed
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="barGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#c0ff00"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#c0ff00"
                            stopOpacity={0.2}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="category"
                        stroke="#888"
                        style={{ fontSize: "0.7rem" }}
                        axisLine={false}
                        tickLine={false}
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
                        dataKey="amount"
                        fill="url(#barGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Issuance Feed */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg">Recent Activity</h3>
                    <Link
                      href="/merchant/analytics"
                      className="text-sm text-accent hover:underline flex items-center gap-1"
                    >
                      Go to Analytics
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  {transactionsLoading ? (
                    <div className="bg-panel border border-border rounded-xl p-8 text-center">
                      <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-text-secondary text-sm">
                        Loading transactions...
                      </p>
                    </div>
                  ) : transactionRecords.length === 0 ? (
                    <div className="bg-panel border border-border rounded-xl p-8 text-center">
                      <p className="text-text-secondary text-sm">
                        No transactions yet
                      </p>
                      <p className="text-text-secondary text-xs mt-2">
                        Issue rewards to see them appear here
                      </p>
                    </div>
                  ) : (
                    <div className="bg-panel border border-border rounded-xl divide-y divide-border">
                      {transactionRecords.slice(0, 10).map((record) => {
                        const isIssue = record.transactionType === 'issue';
                        const date = new Date(record.timestamp * 1000);

                        return (
                          <div
                            key={record.publicKey}
                            className="p-4 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIssue ? 'bg-accent/10' : 'bg-red-500/10'
                                }`}>
                                <svg
                                  className={`w-5 h-5 ${isIssue ? 'text-accent' : 'text-red-500'}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                >
                                  <title>{isIssue ? 'Issued' : 'Redeemed'}</title>
                                  <circle cx="9" cy="9" r="6" />
                                  <circle cx="15" cy="15" r="6" />
                                </svg>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">
                                      {isIssue ? 'Rewards Issued' : 'Rewards Redeemed'}
                                    </p>
                                    <span className={`text-sm font-bold ${isIssue ? 'text-accent' : 'text-red-500'}`}>
                                      {isIssue ? '+' : '-'}{record.amount.toLocaleString()} SLCY
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-secondary whitespace-nowrap">
                                    {date.toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>

                                <code className="text-[0.7rem] text-text-secondary font-mono block mb-1.5">
                                  {record.customer}
                                </code>

                                {record.tier && (
                                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-text-secondary">
                                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded capitalize">
                                      {record.tier}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </main>

              {/* Sidebar */}
              <aside>
                {/* Issue Rewards Panel */}
                <div className="bg-panel border border-border p-8 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Issue Rewards</h3>
                    <button
                      type="button"
                      onClick={() => setShowInfoModal(true)}
                      className="text-accent hover:text-accent/80 transition-colors"
                      aria-label="Info"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="customer-wallet"
                      className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                    >
                      Customer Wallet
                    </label>
                    <input
                      id="customer-wallet"
                      type="text"
                      value={customerWallet}
                      onChange={(e) => setCustomerWallet(e.target.value)}
                      className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                      placeholder="Paste wallet address"
                    />
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

                  <div className="mb-6">
                    <Dropdown
                      label="Apply Reward Rule (Optional)"
                      value={selectedRuleId?.toString() ?? ""}
                      onChange={(value) =>
                        setSelectedRuleId(value ? parseInt(value, 10) : null)
                      }
                      placeholder="No rule (base rate only)"
                      options={[
                        { value: "", label: "No rule (base rate only)" },
                        ...rules
                          .filter((rule) => rule.isActive)
                          .map((rule) => ({
                            value: rule.ruleId.toString(),
                            label: `${rule.name} (${rule.multiplier / 100}x multiplier${rule.minPurchase > 0 ? `, min $${(rule.minPurchase / 100).toFixed(2)}` : ""})`,
                          })),
                      ]}
                    />
                    {selectedRule &&
                      purchaseAmount &&
                      parseFloat(purchaseAmount) <
                      selectedRule.minPurchase / 100 && (
                        <p className="text-xs text-yellow-500 mt-2">
                          Purchase amount must be at least $
                          {(selectedRule.minPurchase / 100).toFixed(2)} to apply
                          this rule
                        </p>
                      )}
                  </div>

                  <div className="bg-black border border-dashed border-border rounded-lg p-5 mb-6">
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>Base Reward ({rewardRate.toFixed(2)} SLCY/$)</span>
                      <span className="text-accent font-semibold">{baseReward.toFixed(2)} SLCY</span>
                    </div>
                    {selectedRule &&
                      purchaseAmount &&
                      parseFloat(purchaseAmount) >=
                      selectedRule.minPurchase / 100 && (
                        <div className="flex justify-between text-sm text-accent mb-2">
                          <span>{selectedRule.name}</span>
                          <span className="font-semibold">{ruleMultiplier.toFixed(2)}x</span>
                        </div>
                      )}
                    <div className="flex justify-between text-sm mb-2">
                      <span className={customerTierInfo ? "text-text" : "text-text-secondary"}>
                        Customer Tier Multiplier
                      </span>
                      {fetchingTier ? (
                        <span className="text-text-secondary text-xs">Loading...</span>
                      ) : customerTierInfo ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                            {customerTierInfo.tierName}
                          </span>
                          <span className="font-semibold text-accent">
                            {customerTierInfo.multiplier.toFixed(2)}x
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-secondary text-xs">Enter wallet to check</span>
                      )}
                    </div>
                    <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-border">
                      <span className="text-text">Estimated Issuance</span>
                      <span className="text-accent text-lg">
                        ~{estimatedIssuance.toFixed(2)} SLCY
                      </span>
                    </div>
                    {!customerTierInfo && (
                      <p className="text-[0.65rem] text-yellow-500/80 mt-3 text-center">
                        Note: Tier multiplier will be applied on-chain (1.0x-2.0x)
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleIssueRewards}
                    disabled={
                      issuingRewards || !customerWallet || !purchaseAmount
                    }
                    className="bg-accent text-black px-4 py-4 border-none font-bold text-base cursor-pointer rounded-lg w-full transition-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {issuingRewards
                      ? "Processing..."
                      : "Confirm & Issue Reward"}
                  </button>

                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"
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
                      <div>
                        <p className="text-xs text-blue-400 font-semibold mb-1">
                          Customer Must Register First
                        </p>
                        <p className="text-xs text-text-secondary">
                          Customers need to register themselves by visiting your
                          merchant page and clicking "Register to Earn Rewards".
                          You cannot register customers on their behalf for
                          security reasons.
                        </p>
                      </div>
                    </div>
                  </div>

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
                    <p className="text-sm text-text-secondary">
                      Loading rules...
                    </p>
                  ) : rules.length === 0 ? (
                    <p className="text-sm text-text-secondary">
                      No rules created yet
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {rules.slice(0, 3).map((rule) => (
                        <div
                          key={rule.publicKey.toString()}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{rule.name}</span>
                          <span
                            className={`text-xs ${rule.isActive ? "text-accent" : "text-text-secondary"}`}
                          >
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
      </div>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="How Reward Issuance Works"
        size="md"
      >
        <div className="space-y-4 text-sm text-text-secondary">
          <div>
            <h4 className="text-text font-semibold mb-2">
              Base Reward Calculation
            </h4>
            <p>
              Rewards are calculated by multiplying the purchase amount by your
              merchant reward rate. For example, with a 2.00 SLCY/$ rate, a $20
              purchase earns 40 SLCY tokens.
            </p>
          </div>

          <div>
            <h4 className="text-text font-semibold mb-2">
              Reward Rules (Optional)
            </h4>
            <p>
              You can apply bonus multipliers through reward rules. A 3x
              multiplier on 40 SLCY becomes 120 SLCY. Rules can have minimum
              purchase requirements.
            </p>
          </div>

          <div>
            <h4 className="text-text font-semibold mb-2">
              Customer Tier Multipliers
            </h4>
            <p>Customer loyalty tiers are automatically applied on-chain:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Bronze: 1.0x (default)</li>
              <li>Silver: 1.25x (earned 1,000+ SLCY)</li>
              <li>Gold: 1.5x (earned 5,000+ SLCY)</li>
              <li>Platinum: 2.0x (earned 10,000+ SLCY)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-semibold mb-2">
              Customer Registration
            </h4>
            <p>
              Customers must register themselves by visiting your merchant page.
              You cannot register customers on their behalf for security
              reasons.
            </p>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  );
}
