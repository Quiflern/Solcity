"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useCustomerAccount } from "@/hooks/customer/useCustomerAccount";
import {
  useCustomerVouchers,
  type Voucher,
} from "@/hooks/customer/useCustomerVouchers";
import { useAllMerchants } from "@/hooks/merchant/useAllMerchants";
import { calculateTierProgress, getTierInfo } from "@/lib/tiers";

/**
 * Customer Profile Page
 *
 * Displays comprehensive customer profile information including:
 * - Loyalty tier status with visual progress indicator
 * - Lifetime statistics (earned, redeemed, transactions, streak)
 * - Active vouchers with QR codes for redemption
 * - Transaction history
 * - Available merchants
 * - Wallet information and blockchain explorer links
 *
 * @returns Customer profile component with detailed account information
 */
export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { customerAccount, isRegistered, isLoading } = useCustomerAccount();
  const { merchants } = useAllMerchants();
  const { data: vouchers = [], isLoading: vouchersLoading } =
    useCustomerVouchers();
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Extract customer account data with safe defaults
  const totalEarned = customerAccount?.totalEarned
    ? Number(customerAccount.totalEarned)
    : 0;
  const totalRedeemed = customerAccount?.totalRedeemed
    ? Number(customerAccount.totalRedeemed)
    : 0;
  const transactionCount = customerAccount?.transactionCount
    ? Number(customerAccount.transactionCount)
    : 0;
  const streakDays = customerAccount?.streakDays
    ? Number(customerAccount.streakDays)
    : 0;
  const joinedAt = customerAccount?.joinedAt
    ? new Date(Number(customerAccount.joinedAt) * 1000)
    : null;
  const tier = customerAccount?.tier || { bronze: {} };

  // Calculate tier progression
  const tierInfo = getTierInfo(tier);
  const { progress: progressToNextTier, tokensNeeded } = calculateTierProgress(
    totalEarned,
    tierInfo,
  );

  // Get active merchants for display (limit to 5)
  const activeMerchants = merchants.filter((m) => m.isActive).slice(0, 5);

  /**
   * Generates an avatar URL from merchant data
   * @param avatarCode - Avatar identifier or URL from merchant
   * @param businessName - Merchant business name for fallback generation
   * @returns Complete avatar URL
   */
  const getAvatarUrl = (avatarCode: string, businessName: string) => {
    if (!avatarCode) {
      return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(businessName)}&backgroundColor=d0ff14`;
    }
    if (avatarCode.startsWith("http://") || avatarCode.startsWith("https://")) {
      return avatarCode;
    }
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarCode)}&backgroundColor=d0ff14`;
  };

  /**
   * Formats a Solana address to shortened display format
   * @param address - Full Solana address
   * @returns Shortened address (e.g., "AbC1...XyZ9")
   */
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  /**
   * Formats a date object to readable string
   * @param date - Date object to format
   * @returns Formatted date string (e.g., "January 15, 2024")
   */
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Copies text to system clipboard
   * @param text - Text to copy
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  /**
   * Opens the voucher detail modal
   * @param voucher - Voucher to display
   */
  const openVoucherModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setVoucherModalOpen(true);
  };

  /**
   * Closes the voucher detail modal and clears selection
   */
  const closeVoucherModal = () => {
    setVoucherModalOpen(false);
    setSelectedVoucher(null);
  };

  // Get active vouchers (not used) for display
  const activeVouchers = vouchers.filter((v) => !v.isUsed).slice(0, 3);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isRegistered) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="bg-panel border border-border rounded-xl p-12 max-w-2xl mx-auto">
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
              <h2 className="text-2xl font-bold mb-3">Not Registered</h2>
              <p className="text-text-secondary mb-8">
                You need to register with a merchant to create your profile.
              </p>
              <Link
                href="/explore"
                className="inline-block bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Explore Merchants
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <main className="max-w-[1400px] mx-auto px-8 py-12 w-full">
          {/* Profile Header */}
          <section className="flex items-center gap-8 mb-12">
            <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#333] border border-border flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-2">Customer Profile</h1>
              <div className="flex items-center gap-3 text-text-secondary font-mono text-sm bg-panel px-3 py-2 rounded-md border border-border w-fit">
                {publicKey ? formatAddress(publicKey.toString()) : ""}
                <button
                  type="button"
                  onClick={() =>
                    publicKey && copyToClipboard(publicKey.toString())
                  }
                  className="bg-transparent border-none text-accent cursor-pointer text-xs uppercase font-bold tracking-wider hover:text-accent/80 transition-colors"
                >
                  Copy
                </button>
              </div>
              {joinedAt && (
                <p className="text-sm text-text-secondary mt-3">
                  Member since {formatDate(joinedAt)}
                </p>
              )}
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Tier Card */}
            <div className="bg-panel border border-border rounded-xl p-8">
              <div className="text-xs uppercase tracking-widest text-text-secondary mb-6">
                Current Tier
              </div>
              <div className="inline-block px-4 py-2 bg-accent/10 text-accent font-extrabold text-sm rounded mb-6 border border-accent/20">
                {tierInfo.displayName.toUpperCase()} TIER
              </div>

              {/* Tier Progress - Shows progress to next tier level */}
              {tierInfo.next && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">
                      Progress to {tierInfo.next}
                    </span>
                    <span className="text-accent font-semibold">
                      {tokensNeeded.toLocaleString()} SLCY
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent/50 to-accent rounded-full transition-all duration-500"
                      style={{ width: `${progressToNextTier}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>{tierInfo.min.toLocaleString()}</span>
                    <span>{(tierInfo.max + 1).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {!tierInfo.next && (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg border border-accent/20">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold">
                      Max Tier Reached!
                    </span>
                  </div>
                </div>
              )}

              {/* Tier Benefits */}
              <div>
                <h4 className="text-xs mb-4 text-text-secondary uppercase tracking-wider">
                  Tier Benefits
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <span className="text-accent">✓</span>
                    <span>{tierInfo.multiplier}x Reward Multiplier</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-panel border border-border rounded-xl p-8">
              <div className="text-xs uppercase tracking-widest text-text-secondary mb-6">
                Activity Stats
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-text-secondary text-xs mb-1">
                    Total Earned
                  </div>
                  <div className="text-3xl font-bold text-accent">
                    {totalEarned.toLocaleString()} SLCY
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs mb-1">
                    Total Redeemed
                  </div>
                  <div className="text-3xl font-bold">
                    {totalRedeemed.toLocaleString()} SLCY
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-text-secondary text-xs mb-1">
                      Transactions
                    </div>
                    <div className="text-2xl font-semibold">
                      {transactionCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-1">
                      Streak Days
                    </div>
                    <div className="text-2xl font-semibold flex items-center gap-2">
                      {streakDays}
                      {streakDays > 0 && <span className="text-base">🔥</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Vouchers */}
          <div className="bg-panel border border-border rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs uppercase tracking-widest text-text-secondary">
                My Vouchers
              </div>
              <Link
                href="/customer/redeem?tab=history"
                className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
              >
                View All
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            {vouchersLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeVouchers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <Ticket className="w-8 h-8 text-accent" />
                </div>
                <p className="text-text-secondary mb-2">No active vouchers</p>
                <p className="text-text-secondary text-sm mb-4">
                  Redeem rewards to get vouchers
                </p>
                <Link
                  href="/customer/redeem"
                  className="inline-block text-accent hover:text-accent/80 transition-colors text-sm font-medium"
                >
                  Browse Offers →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {activeVouchers.map((voucher) => (
                  <button
                    key={voucher.publicKey}
                    type="button"
                    onClick={() => openVoucherModal(voucher)}
                    className="text-left p-4 bg-bg-primary rounded-lg border border-border hover:border-accent transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-[0.65rem] uppercase font-bold px-2 py-1 rounded bg-accent/10 text-accent border border-accent/20">
                        Active
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors line-clamp-1">
                      {voucher.offerName}
                    </h3>
                    <p className="text-xs text-text-secondary mb-2 line-clamp-1">
                      {voucher.merchantName}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        {voucher.cost} SLCY
                      </span>
                      <span className="text-text-secondary">
                        Exp:{" "}
                        {new Date(voucher.expiresAt * 1000).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Linked Merchants */}
          <div className="bg-panel border border-border rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs uppercase tracking-widest text-text-secondary">
                Available Merchants
              </div>
              <Link
                href="/explore"
                className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
              >
                View All
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            {activeMerchants.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No merchants available yet
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activeMerchants.map((merchant) => (
                  <Link
                    key={merchant.publicKey.toString()}
                    href={`/explore/${merchant.publicKey.toString()}`}
                    className="flex items-center justify-between p-4 bg-bg-primary rounded-lg border border-border hover:border-accent transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-panel border border-border">
                        {/* biome-ignore lint/performance/noImgElement: Avatar from external source */}
                        <img
                          src={getAvatarUrl(merchant.avatarUrl, merchant.name)}
                          alt={merchant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-accent transition-colors">
                          {merchant.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {(merchant.rewardRate / 100).toFixed(1)} SLCY / $
                        </div>
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* On-Chain Metadata */}
          <section className="p-8 bg-panel border border-border rounded-xl">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-8">
              On-Chain Information
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="block text-[0.7rem] text-text-secondary mb-2 uppercase tracking-wider">
                  Wallet Address
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-mono text-sm">
                    {publicKey ? publicKey.toString() : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      publicKey && copyToClipboard(publicKey.toString())
                    }
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <div className="block text-[0.7rem] text-text-secondary mb-2 uppercase tracking-wider">
                  View on Explorer
                </div>
                <a
                  href={`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=custom&customUrl=http://localhost:8899`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 transition-colors font-mono text-sm flex items-center gap-1.5"
                >
                  Solana Explorer
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Voucher Modal */}
        <Modal
          isOpen={voucherModalOpen}
          onClose={closeVoucherModal}
          title=""
          size="md"
        >
          {selectedVoucher && (
            <div className="space-y-6">
              {/* Voucher Card - Clean, no background effects */}
              <div className="relative flex items-center justify-center py-4">
                {/* Voucher Card - Sharp corners */}
                <div
                  className="relative w-full max-w-[280px] h-[420px] bg-[rgba(25,25,25,0.95)] rounded-sm p-5 flex flex-col justify-between overflow-hidden"
                  style={{
                    boxShadow: `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      0 15px 40px -10px rgba(0, 0, 0, 0.8)
                    `,
                  }}
                >
                  {/* Border gradient */}
                  <div
                    className="absolute -inset-px rounded-sm pointer-events-none opacity-50"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.1), transparent 40%, #d0ff14)",
                      padding: "1px",
                      WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />

                  {/* Status badge */}
                  {selectedVoucher.isUsed && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[0.6rem] uppercase font-bold px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        Used
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-accent shadow-[0_0_8px_#d0ff14]" />
                        <span className="font-bold tracking-tight text-sm">
                          SOLCITY
                        </span>
                      </div>
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold mt-0.5">
                        Proof of Redemption
                      </span>
                    </div>

                    {/* Cost badge */}
                    <div
                      className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 flex flex-col items-end"
                      style={{
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                        Cost
                      </span>
                      <span
                        className="font-bold font-mono text-[0.7rem] text-accent"
                        style={{
                          textShadow: "0 0 8px rgba(208, 255, 20, 0.3)",
                        }}
                      >
                        {selectedVoucher.cost} SLCY
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-1">
                        Merchant
                      </span>
                      <h2 className="text-base font-medium text-white tracking-wide">
                        {selectedVoucher.merchantName}
                      </h2>
                    </div>

                    <div className="relative">
                      {/* Accent bar */}
                      <div
                        className="absolute -left-5 w-0.5 h-full bg-accent"
                        style={{ boxShadow: "0 0 10px #d0ff14" }}
                      />
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                        Offer Details
                      </span>
                      <h1 className="text-xl font-bold text-white leading-tight">
                        {selectedVoucher.offerName.split(" - ")[0] ||
                          selectedVoucher.offerName}
                        <br />
                        <span className="text-gray-400 text-base">
                          {selectedVoucher.offerName.split(" - ")[1] ||
                            selectedVoucher.offerDescription.split(".")[0]}
                        </span>
                      </h1>
                    </div>
                  </div>

                  {/* Perforation - Zigzag like a ticket */}
                  <div className="relative w-full my-3">
                    <svg
                      width="100%"
                      height="8"
                      viewBox="0 0 280 8"
                      preserveAspectRatio="none"
                      className="opacity-40"
                      aria-hidden="true"
                    >
                      <path
                        d="M0,4 L7,0 L14,4 L21,0 L28,4 L35,0 L42,4 L49,0 L56,4 L63,0 L70,4 L77,0 L84,4 L91,0 L98,4 L105,0 L112,4 L119,0 L126,4 L133,0 L140,4 L147,0 L154,4 L161,0 L168,4 L175,0 L182,4 L189,0 L196,4 L203,0 L210,4 L217,0 L224,4 L231,0 L238,4 L245,0 L252,4 L259,0 L266,4 L273,0 L280,4"
                        stroke="#666"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Bottom section */}
                  <div className="flex flex-row items-end justify-between gap-3">
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                          Redemption Code
                        </span>
                        <div className="font-mono text-sm text-accent font-bold tracking-widest">
                          {selectedVoucher.redemptionCode}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                          Expires
                        </span>
                        <span className="text-[#eee] text-xs font-medium">
                          {new Date(
                            selectedVoucher.expiresAt * 1000,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="w-[70px] h-[70px] bg-white rounded p-1 shadow-lg flex items-center justify-center shrink-0">
                      {/* biome-ignore lint/performance/noImgElement: External QR code API requires img element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(selectedVoucher.redemptionCode)}`}
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                onClick={closeVoucherModal}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
