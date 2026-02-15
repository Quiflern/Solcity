"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Navigation */}
      <nav className="h-[72px] border-b border-border flex items-center justify-between px-8 bg-background sticky top-0 z-50">
        <Link href="/" className="text-lg font-bold tracking-wider flex gap-3 items-center">
          <div className="w-3.5 h-3.5 bg-accent" />
          SOLCITY
        </Link>
        <div className="flex gap-10">
          <Link href="/merchant" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            For Businesses
          </Link>
          <Link href="/explore" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            Explore Merchants
          </Link>
          <Link href="/dashboard" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="text-accent text-sm font-medium transition-colors">
            My Profile
          </Link>
        </div>
        <button
          type="button"
          className="border border-accent bg-accent/5 text-accent px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2"
        >
          <span>7Xy...r3A</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-12 w-full">
        {/* Profile Header */}
        <section className="flex items-center gap-8 mb-12">
          <div className="w-[100px] h-[100px] rounded-xl bg-linear-to-br from-[#1a1a1a] to-[#333] border border-border flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2">Collector #8429</h1>
            <div className="flex items-center gap-3 text-text-secondary font-mono text-base bg-panel px-3 py-1.5 rounded-md border border-border">
              7Xy12...r3A9B
              <button
                type="button"
                className="bg-transparent border-none text-accent cursor-pointer text-xs uppercase font-bold tracking-wider"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-3">Member since January 12, 2024</p>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">

          {/* Current Standing Card */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-6 flex justify-between">
              Current Standing <span>XP: 2,450</span>
            </div>
            <div className="inline-block px-3 py-1 bg-linear-to-r from-[#FFD700] to-[#B8860B] text-black font-extrabold text-xs rounded mb-4">
              GOLD TIER
            </div>
            <div className="my-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Level 14</span>
                <span className="text-text-secondary">550 XP to Platinum</span>
              </div>
              <div className="h-2 bg-background rounded overflow-hidden">
                <div className="h-full bg-accent w-[72%]" />
              </div>
            </div>
            <div>
              <h4 className="text-xs mb-4 text-text-secondary">CURRENT BENEFITS</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  1.5x Multiplier
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Priority Access
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Low Gas Swap
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Exclusive Merch
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Radar Card */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-6">Engagement Radar</div>
            <div className="h-[200px] flex items-center justify-center relative">
              <div className="w-[160px] h-[160px] border border-border rounded-full relative bg-[repeating-radial-gradient(circle,transparent,transparent_20px,var(--border-color)_21px)]">
                <div
                  className="absolute top-[20%] left-[20%] right-[10%] bottom-[30%] bg-accent/20 border border-accent"
                  style={{ clipPath: "polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)" }}
                />
              </div>
              <span className="absolute top-0 text-[0.65rem] text-text-secondary uppercase">
                Earning Frequency
              </span>
              <span className="absolute right-[-10px] top-[40%] text-[0.65rem] text-text-secondary uppercase">
                Redemption
              </span>
              <span className="absolute right-[10px] bottom-0 text-[0.65rem] text-text-secondary uppercase">
                Merchant Diversity
              </span>
              <span className="absolute left-[10px] bottom-0 text-[0.65rem] text-text-secondary uppercase">
                Tier Progress
              </span>
              <span className="absolute left-[-10px] top-[40%] text-[0.65rem] text-text-secondary uppercase">
                Streak
              </span>
            </div>
          </div>

          {/* Linked Merchants Card */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-6">Linked Merchants</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-panel rounded flex items-center justify-center text-sm">☕</div>
                  <span>Ethos Coffee</span>
                </div>
                <span className="font-semibold text-accent">1,240 SLCY</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-panel rounded flex items-center justify-center text-sm">👕</div>
                  <span>Nexus Apparel</span>
                </div>
                <span className="font-semibold text-accent">850 SLCY</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-white/3">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-panel rounded flex items-center justify-center text-sm">💪</div>
                  <span>Core Collective</span>
                </div>
                <span className="font-semibold text-accent">400 SLCY</span>
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-panel border border-border rounded-xl p-6">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-6">Achievements</div>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-background rounded-lg border border-accent/30 bg-[radial-gradient(circle_at_center,rgba(208,255,20,0.05),transparent)]">
                <div className="text-2xl mb-2">🌱</div>
                <div className="text-[0.7rem] font-semibold uppercase">First Reward</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border border-accent/30 bg-[radial-gradient(circle_at_center,rgba(208,255,20,0.05),transparent)]">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-[0.7rem] font-semibold uppercase">100 SLCY</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border border-accent/30 bg-[radial-gradient(circle_at_center,rgba(208,255,20,0.05),transparent)]">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-[0.7rem] font-semibold uppercase">Gold Tier</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border border-border opacity-50">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-[0.7rem] font-semibold uppercase">30-Day Streak</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg border border-border opacity-50">
                <div className="text-2xl mb-2">🎁</div>
                <div className="text-[0.7rem] font-semibold uppercase">Redeemer</div>
              </div>
            </div>
          </div>
        </div>

        {/* On-Chain Metadata */}
        <section className="mt-12 p-8 bg-panel border border-border rounded-xl">
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-8">On-Chain Metadata</div>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <label className="block text-[0.7rem] text-text-secondary mb-2 uppercase">Customer PDA</label>
              <a href="#" className="text-text-primary font-mono text-sm flex items-center gap-1.5 hover:text-accent">
                H7pA...kM2n
                <span className="text-xs">↗</span>
              </a>
            </div>
            <div>
              <label className="block text-[0.7rem] text-text-secondary mb-2 uppercase">
                Primary SLCY Account
              </label>
              <a href="#" className="text-text-primary font-mono text-sm flex items-center gap-1.5 hover:text-accent">
                3vRt...9pLx
                <span className="text-xs">↗</span>
              </a>
            </div>
            <div>
              <label className="block text-[0.7rem] text-text-secondary mb-2 uppercase">View on Explorer</label>
              <a href="#" className="text-text-primary font-mono text-sm flex items-center gap-1.5 hover:text-accent">
                Solscan
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-panel border-t border-border py-16 px-8 mt-auto">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[2fr_1fr_1fr_1fr] gap-16">
          <div>
            <div className="text-lg font-bold tracking-wider flex gap-3 items-center mb-4">
              <div className="w-3.5 h-3.5 bg-accent" />
              SOLCITY
            </div>
            <p className="text-text-secondary leading-relaxed">The future of loyalty. Built on Solana.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Product</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/explore" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
