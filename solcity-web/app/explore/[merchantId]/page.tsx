"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;

  // Mock data - in real app, fetch based on merchantId
  const merchant = {
    id: merchantId,
    name: "Midnight Brews Co.",
    category: "Lifestyle • Coffee & Tea",
    description:
      "Artisanal coffee roasters focused on sustainable sourcing and community rewards. Midnight Brews utilizes Solana Token Extensions to provide instant cash-back and yield on held loyalty tokens.",
    joinDate: "February 2024",
    holders: "12.4k",
    baseReward: "5%",
    weekendBonus: "+2% Weekend Bonus",
    tokenAPY: "12.5%",
    activeCampaigns: "3 Live",
    merchantPDA: "8vJb...p9Xq2mR9...wK1L",
    tokenMint: "MBreW...vH7s4...x92nK",
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">

        {/* Merchant Header */}
        <header className="flex gap-10 mb-16 items-start">
          <div className="w-[120px] h-[120px] bg-panel border border-border flex items-center justify-center relative">
            <svg className="w-[60px] stroke-accent" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <div className="absolute -bottom-2.5 -right-2.5 bg-accent text-black text-[10px] font-extrabold px-2 py-1 rounded-sm tracking-wider">
              VERIFIED
            </div>
          </div>
          <div className="flex-1">
            <span className="text-accent text-xs uppercase tracking-widest mb-2 block">{merchant.category}</span>
            <h1 className="text-4xl font-medium tracking-tight mb-4">{merchant.name}</h1>
            <p className="text-text-secondary leading-relaxed max-w-[600px] mb-6">{merchant.description}</p>
            <span className="text-sm text-[#555]">
              Onboarded {merchant.joinDate} • {merchant.holders} Holders
            </span>
          </div>
        </header>

        {/* Program Summary */}
        <div className="grid grid-cols-3 gap-px bg-border border border-border mb-16">
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">Base Reward Rate</span>
            <div className="text-2xl font-semibold text-accent">
              {merchant.baseReward}{" "}
              <span className="text-[0.7rem] bg-accent/10 text-accent px-1.5 py-0.5 ml-2.5 border border-accent/30">
                {merchant.weekendBonus}
              </span>
            </div>
          </div>
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">Token APY (Held)</span>
            <div className="text-2xl font-semibold text-accent">{merchant.tokenAPY}</div>
          </div>
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">Active Campaigns</span>
            <div className="text-2xl font-semibold text-accent">{merchant.activeCampaigns}</div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-[2fr_1fr] gap-12">
          {/* Main Content */}
          <div>
            {/* Active Reward Rules */}
            <section className="mb-12">
              <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                <span className="w-1 h-[18px] bg-accent" />
                Active Reward Rules
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-panel border border-border p-6 transition-all hover:border-accent hover:-translate-y-0.5">
                  <svg
                    className="w-6 h-6 stroke-accent mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-base mb-2">Early Bird Multiplier</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Earn 2x tokens on any purchase made before 9:00 AM local time. Automatic verification via
                    Oracle.
                  </p>
                </div>
                <div className="bg-panel border border-border p-6 transition-all hover:border-accent hover:-translate-y-0.5">
                  <svg
                    className="w-6 h-6 stroke-accent mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h4 className="text-base mb-2">Social Proof Bonus</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Holders with a linked Twitter/X account receive a flat 100 $MBREW bonus on their first weekly
                    purchase.
                  </p>
                </div>
              </div>
            </section>

            {/* Loyalty Tier Benefits */}
            <section>
              <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                <span className="w-1 h-[18px] bg-accent" />
                Loyalty Tier Benefits
              </h2>
              <table className="w-full border-collapse mb-16">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b border-border text-xs uppercase text-text-secondary">
                      Tier Level
                    </th>
                    <th className="text-left p-4 border-b border-border text-xs uppercase text-text-secondary">
                      Requirement
                    </th>
                    <th className="text-left p-4 border-b border-border text-xs uppercase text-text-secondary">
                      Multiplier
                    </th>
                    <th className="text-left p-4 border-b border-border text-xs uppercase text-text-secondary">
                      Perks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <div className="font-semibold flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-accent shadow-[0_0_10px_var(--accent)]" />
                        Bronze
                      </div>
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">0 - 5k $MBREW</td>
                    <td className="py-5 px-4 border-b border-border text-sm">1.0x</td>
                    <td className="py-5 px-4 border-b border-border text-sm">Standard Rewards</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <div className="font-semibold flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-border" />
                        Silver
                      </div>
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">5k - 25k $MBREW</td>
                    <td className="py-5 px-4 border-b border-border text-sm">1.2x</td>
                    <td className="py-5 px-4 border-b border-border text-sm">Free Monthly Drink</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-4 border-b border-border text-sm">
                      <div className="font-semibold flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-border" />
                        Gold
                      </div>
                    </td>
                    <td className="py-5 px-4 border-b border-border text-sm">25k+ $MBREW</td>
                    <td className="py-5 px-4 border-b border-border text-sm">1.5x</td>
                    <td className="py-5 px-4 border-b border-border text-sm">VIP Event Access + NFT</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* CTA Widget */}
            <div className="bg-accent text-black p-10 text-center relative overflow-hidden">
              <h3 className="text-xl font-bold mb-6">Start Earning Here</h3>
              <div className="w-[180px] h-[180px] bg-white mx-auto mb-6 flex items-center justify-center p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=solcity_midnightbrews_earn"
                  alt="Merchant QR Code"
                  className="w-full h-full contrast-150"
                />
              </div>
              <p className="text-sm opacity-80">
                Scan this code at checkout to register your wallet and start earning rewards instantly.
              </p>
            </div>

            {/* On-Chain Verification Widget */}
            <div className="bg-panel border border-border p-6">
              <h4 className="text-sm mb-6 tracking-wider">ON-CHAIN VERIFICATION</h4>

              <div className="mb-5">
                <span className="text-[0.65rem] uppercase text-text-secondary block mb-1.5">
                  Merchant PDA Address
                </span>
                <span className="font-mono text-xs text-text-primary break-all bg-black p-2.5 border border-border block">
                  {merchant.merchantPDA}
                </span>
              </div>

              <div className="mb-5">
                <span className="text-[0.65rem] uppercase text-text-secondary block mb-1.5">
                  Token Mint Address
                </span>
                <span className="font-mono text-xs text-text-primary break-all bg-black p-2.5 border border-border block">
                  {merchant.tokenMint}
                </span>
              </div>

              <a
                href="#"
                className="text-accent text-xs flex items-center gap-1.5 mt-4 hover:underline"
              >
                View on Solana Explorer
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
              <a
                href="#"
                className="text-accent text-xs flex items-center gap-1.5 mt-4 hover:underline"
              >
                Inspect Token Extensions
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
