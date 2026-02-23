"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCustomerAccount } from "@/hooks/useCustomerAccount";
import { useAllMerchants } from "@/hooks/useAllMerchants";
import { getTierInfo, calculateTierProgress } from "@/lib/tiers";
import Link from "next/link";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const { customerAccount, isRegistered, isLoading } = useCustomerAccount();
  const { merchants } = useAllMerchants();

  const totalEarned = customerAccount?.totalEarned ? Number(customerAccount.totalEarned) : 0;
  const totalRedeemed = customerAccount?.totalRedeemed ? Number(customerAccount.totalRedeemed) : 0;
  const transactionCount = customerAccount?.transactionCount ? Number(customerAccount.transactionCount) : 0;
  const streakDays = customerAccount?.streakDays ? Number(customerAccount.streakDays) : 0;
  const joinedAt = customerAccount?.joinedAt ? new Date(Number(customerAccount.joinedAt) * 1000) : null;
  const tier = customerAccount?.tier || { bronze: {} };

  const tierInfo = getTierInfo(tier);
  const { progress: progressToNextTier, tokensNeeded } = calculateTierProgress(totalEarned, tierInfo);

  // Get active merchants for display (limit to 5)
  const activeMerchants = merchants.filter(m => m.isActive).slice(0, 5);

  const getAvatarUrl = (avatarCode: string, businessName: string) => {
    if (!avatarCode) {
      return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(businessName)}&backgroundColor=d0ff14`;
    }
    if (avatarCode.startsWith('http://') || avatarCode.startsWith('https://')) {
      return avatarCode;
    }
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarCode)}&backgroundColor=d0ff14`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
                <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Not Registered</h2>
              <p className="text-text-secondary mb-8">
                You need to register with a merchant to create your profile.
              </p>
              <Link href="/explore" className="inline-block bg-accent text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
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
                  onClick={() => publicKey && copyToClipboard(publicKey.toString())}
                  className="bg-transparent border-none text-accent cursor-pointer text-xs uppercase font-bold tracking-wider hover:text-accent/80 transition-colors"
                >
                  Copy
                </button>
              </div>
              {joinedAt && (
                <p className="text-sm text-text-secondary mt-3">Member since {formatDate(joinedAt)}</p>
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

              {/* Tier Progress */}
              {tierInfo.next && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Progress to {tierInfo.next}</span>
                    <span className="text-accent font-semibold">{tokensNeeded.toLocaleString()} SLCY</span>
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
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold">Max Tier Reached!</span>
                  </div>
                </div>
              )}

              {/* Tier Benefits */}
              <div>
                <h4 className="text-xs mb-4 text-text-secondary uppercase tracking-wider">Tier Benefits</h4>
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
                  <div className="text-text-secondary text-xs mb-1">Total Earned</div>
                  <div className="text-3xl font-bold text-accent">{totalEarned.toLocaleString()} SLCY</div>
                </div>
                <div>
                  <div className="text-text-secondary text-xs mb-1">Total Redeemed</div>
                  <div className="text-3xl font-bold">{totalRedeemed.toLocaleString()} SLCY</div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-text-secondary text-xs mb-1">Transactions</div>
                    <div className="text-2xl font-semibold">{transactionCount}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-xs mb-1">Streak Days</div>
                    <div className="text-2xl font-semibold flex items-center gap-2">
                      {streakDays}
                      {streakDays > 0 && <span className="text-base">🔥</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Merchants */}
          <div className="bg-panel border border-border rounded-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs uppercase tracking-widest text-text-secondary">
                Available Merchants
              </div>
              <Link href="/explore" className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                View All
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                <label className="block text-[0.7rem] text-text-secondary mb-2 uppercase tracking-wider">
                  Wallet Address
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-mono text-sm">
                    {publicKey ? publicKey.toString() : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => publicKey && copyToClipboard(publicKey.toString())}
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[0.7rem] text-text-secondary mb-2 uppercase tracking-wider">
                  View on Explorer
                </label>
                <a
                  href={`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=custom&customUrl=http://localhost:8899`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 transition-colors font-mono text-sm flex items-center gap-1.5"
                >
                  Solana Explorer
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
