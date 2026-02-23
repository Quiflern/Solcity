"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAllMerchants } from "@/hooks/merchant/useAllMerchants";

/**
 * Explore Merchants Page
 *
 * Marketplace for discovering and browsing all active merchants in the Solcity network.
 *
 * Features:
 * - Search functionality to find merchants by name
 * - Category filtering (Food & Drink, Retail, Services, etc.)
 * - Merchant cards showing key information:
 *   - Business name and avatar
 *   - Reward rate (SLCY per dollar spent)
 *   - Total rewards issued
 *   - Join date
 * - Click-through to detailed merchant pages
 *
 * @returns Merchant discovery and browsing interface
 */
export default function ExploreMerchantsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { merchants, isLoading, error } = useAllMerchants();

  /**
   * Extracts unique categories from all merchants
   * @returns Sorted array of unique category names
   */
  const categories = useMemo(() => {
    const uniqueCategories = new Set(merchants.map((m) => m.category));
    return Array.from(uniqueCategories).sort();
  }, [merchants]);

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
   * Filters merchants based on category and search query
   * @returns Filtered array of active merchants
   */
  const filteredMerchants = useMemo(() => {
    let filtered = merchants.filter((m) => m.isActive);

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((m) => m.category === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [merchants, activeFilter, searchQuery]);

  /**
   * Formats a Unix timestamp to readable date string
   * @param timestamp - Unix timestamp in seconds
   * @returns Formatted date string (e.g., "Jan 2024")
   */
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Formats large numbers with K/M suffix
   * @param num - Number to format
   * @returns Formatted string (e.g., "1.5K", "2.3M")
   */
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="py-16 px-8 pb-8 max-w-[1400px] mx-auto w-full">
        <h1 className="text-[2.5rem] font-medium tracking-tight mb-4">
          Discover rewards in <span className="text-accent">Solcity.</span>
        </h1>
        <p className="text-text-secondary max-w-[600px]">
          Browse and join loyalty programs from world-class businesses. Earn
          blockchain tokens on every purchase and watch your rewards grow.
        </p>

        <div className="flex gap-4 mt-8 max-w-[600px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-panel border border-border px-6 py-4 rounded-lg text-text text-base transition-colors outline-none focus:border-accent"
            placeholder="Search merchants..."
          />
        </div>

        <div className="flex gap-2 mt-8 border-b border-border pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
              activeFilter === "all"
                ? "text-accent border-accent"
                : "text-text-secondary border-transparent hover:text-text"
            }`}
          >
            All Merchants ({merchants.filter((m) => m.isActive).length})
          </button>
          {categories.map((category) => {
            const count = merchants.filter(
              (m) => m.isActive && m.category === category,
            ).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeFilter === category
                    ? "text-accent border-accent"
                    : "text-text-secondary border-transparent hover:text-text"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </header>

      {/* Merchant Grid */}
      <main className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 max-w-[1400px] mx-auto mb-20 px-8 w-full">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading merchants...</p>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-500 mb-2">Failed to load merchants</p>
              <p className="text-text-secondary text-sm">{error}</p>
            </div>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-text-secondary">
                {searchQuery
                  ? "No merchants found matching your search"
                  : "No merchants available yet"}
              </p>
            </div>
          </div>
        ) : (
          filteredMerchants.map((merchant) => (
            <Link
              key={merchant.publicKey.toString()}
              href={`/explore/${merchant.publicKey.toString()}`}
              className="bg-panel border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col gap-6 relative overflow-hidden hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] after:content-[''] after:absolute after:top-0 after:right-0 after:w-20 after:h-20 after:bg-[radial-gradient(circle_at_top_right,rgba(208,255,20,0.05),transparent_70%)]"
            >
              <div className="flex gap-4 items-center">
                {/* biome-ignore lint/performance/noImgElement: Avatar from external source */}
                <img
                  src={getAvatarUrl(merchant.avatarUrl, merchant.name)}
                  alt={merchant.name}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{merchant.name}</h3>
                    <span className="bg-accent text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm tracking-wider">
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-[0.7rem] uppercase tracking-wider text-text-secondary">
                    {merchant.category}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-bg p-4 rounded-lg border border-white/3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.7rem] text-text-secondary uppercase">
                    Earn Rate
                  </span>
                  <span className="text-base font-semibold text-accent">
                    {(merchant.rewardRate / 100).toFixed(1)} SLCY / $
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.7rem] text-text-secondary uppercase">
                    Total Issued
                  </span>
                  <span className="text-base font-semibold text-accent">
                    {formatNumber(merchant.totalIssued)} SLCY
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <span>Active</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full" />
                <div className="flex items-center gap-1.5">
                  <span>Joined {formatDate(merchant.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
