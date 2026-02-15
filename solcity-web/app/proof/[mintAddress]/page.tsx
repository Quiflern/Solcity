"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function TokenProofPage() {
  const params = useParams();
  const mintAddress = params.mintAddress as string;

  // Mock data - in real app, fetch based on mintAddress
  const credential = {
    merchantName: "Ethos Coffee Roasters",
    merchantIcon: "☕",
    tokenSymbol: "$ETHOS",
    memberSince: "JAN 2024",
    balance: "12,450.22",
    accruedThisMonth: "+42.15 SLCY",
    loyaltyTier: "PLATINUM ELITE",
    interestRate: "8.5% APY",
    holderAddress: "7xKd...m9Qp",
    mintAddress: "Ethos111...1111",
    programId: "TokenzQdBNb...vM",
    fullMintAddress: "Ethos111111111111111111111111111111111111",
  };

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
        </div>
        <button
          type="button"
          className="border border-border bg-transparent text-text-primary px-6 py-3 text-sm font-medium rounded transition-all"
        >
          Connect Wallet
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1100px] mx-auto my-16 px-8 grid grid-cols-2 gap-16 items-start">
        {/* Credential Card */}
        <div className="bg-linear-135 from-[#1a1a1a] to-[#0a0a0a] border border-border rounded-[20px] p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] before:content-[''] before:absolute before:-top-1/2 before:-left-1/2 before:w-[200%] before:h-[200%] before:bg-[radial-gradient(circle_at_center,rgba(208,255,20,0.05)_0%,transparent_50%)] before:pointer-events-none">
          {/* Card Top */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-black border border-border rounded-xl flex items-center justify-center text-2xl">
                {credential.merchantIcon}
              </div>
              <div>
                <h3 className="text-xl">{credential.merchantName}</h3>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/20">
                  {credential.tokenSymbol}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[0.7rem] uppercase tracking-widest text-text-secondary mb-2">
                Member Since
              </span>
              <span className="text-base font-semibold">{credential.memberSince}</span>
            </div>
          </div>

          {/* Balance Section */}
          <div className="mb-10">
            <span className="text-text-secondary text-sm mb-2 block">Current Rewards Balance</span>
            <div className="text-5xl font-bold tracking-tight">{credential.balance}</div>
            <div className="text-accent text-sm mt-1">{credential.accruedThisMonth} accrued this month</div>
          </div>

          {/* Card Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
            <div>
              <span className="block text-[0.7rem] uppercase tracking-widest text-text-secondary mb-2">
                Loyalty Tier
              </span>
              <span className="text-base font-semibold text-accent">{credential.loyaltyTier}</span>
            </div>
            <div>
              <span className="block text-[0.7rem] uppercase tracking-widest text-text-secondary mb-2">
                Interest Rate
              </span>
              <span className="text-base font-semibold">{credential.interestRate}</span>
            </div>
            <div className="col-span-2 mt-4">
              <span className="block text-[0.7rem] uppercase tracking-widest text-text-secondary mb-2">
                Holder Address
              </span>
              <span className="font-mono text-text-secondary text-xs bg-white/3 px-2 py-1 rounded">
                {credential.holderAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Details */}
        <div>
          <h2 className="text-3xl mb-2">On-Chain Proof</h2>
          <p className="text-text-secondary mb-10">
            Cryptographically verified credential stored on the Solana blockchain using Token-2022 extensions.
          </p>

          {/* Data Grid */}
          <div className="flex flex-col gap-5 mb-12">
            <div className="flex justify-between pb-5 border-b border-border">
              <span className="text-text-secondary text-sm">Mint Address</span>
              <span className="text-sm font-mono text-right">
                <a
                  href={`https://explorer.solana.com/address/${credential.fullMintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#22CCFF] no-underline hover:underline"
                >
                  {credential.mintAddress}
                </a>
              </span>
            </div>
            <div className="flex justify-between pb-5 border-b border-border">
              <span className="text-text-secondary text-sm">Program ID</span>
              <span className="text-sm font-mono text-right">{credential.programId}</span>
            </div>
            <div className="flex justify-between pb-5 border-b border-border">
              <span className="text-text-secondary text-sm">Interest Extension</span>
              <span className="text-sm text-right">
                <span className="bg-[#22CCFF]/10 text-[#22CCFF] px-2 py-0.5 rounded text-xs uppercase font-semibold">
                  Active
                </span>
              </span>
            </div>
            <div className="flex justify-between pb-5 border-b border-border">
              <span className="text-text-secondary text-sm">Metadata Pointer</span>
              <span className="text-sm text-right">Enabled</span>
            </div>
            <div className="flex justify-between pb-5 border-b border-border">
              <span className="text-text-secondary text-sm">Supply Type</span>
              <span className="text-sm text-right">Non-Transferable</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <a
              href={`https://explorer.solana.com/address/${credential.fullMintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-black border-none px-5 py-5 rounded-lg font-bold text-base cursor-pointer text-center no-underline transition-transform hover:scale-[1.02] hover:brightness-110"
            >
              Verify On-Chain (Explorer)
            </a>

            <div className="flex gap-4 mt-4">
              <a
                href={`https://twitter.com/intent/tweet?text=I've achieved ${credential.loyaltyTier} status at ${credential.merchantName}! Check out my on-chain proof on Solcity: https://solcity.io/proof/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-panel border border-border text-white px-4 py-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer no-underline transition-all hover:border-accent hover:bg-white/5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://solcity.io/proof/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-panel border border-border text-white px-4 py-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer no-underline transition-all hover:border-accent hover:bg-white/5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-16 border-t border-border text-center text-text-secondary text-sm">
        <div className="mb-4">
          <div className="text-lg font-bold tracking-wider flex gap-3 items-center justify-center mb-4">
            <div className="w-3.5 h-3.5 bg-accent" />
            SOLCITY
          </div>
          Powered by Solana Token-2022 Interest-Bearing Extensions
        </div>
        © 2024 Solcity Protocol. All rights reserved.
      </footer>
    </div>
  );
}
