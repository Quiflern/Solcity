"use client";

import Link from "next/link";

/**
 * CTASection Component
 *
 * Final call-to-action section before the footer.
 * Encourages visitors to take action and get started with Solcity.
 *
 * Features:
 * - Bold headline with gradient text
 * - Dual CTA buttons for merchants and customers
 * - Animated background with grid pattern
 * - Pulsing accent elements
 */
export default function CTASection() {
  return (
    <section className="relative py-32 bg-black border-t border-border overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(#222_1px,transparent_1px),linear-gradient(90deg,#222_1px,transparent_1px)] bg-size-[50px_50px] opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(208,255,20,0.15)_0%,transparent_70%)] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(208,255,20,0.15)_0%,transparent_70%)] translate-x-1/2 -translate-y-1/2 animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 text-center">
        <h2 className="text-5xl font-medium tracking-tight mb-6 max-w-[800px] mx-auto">
          Ready to transform your{" "}
          <span className="bg-gradient-to-br from-accent to-white bg-clip-text text-transparent">
            loyalty program?
          </span>
        </h2>

        <p className="text-text-secondary text-xl leading-relaxed max-w-[600px] mx-auto mb-12">
          Join hundreds of businesses already using blockchain-powered loyalty
          programs on Solcity.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/merchant/register"
            className="bg-accent text-black px-12 py-5 border-none font-semibold text-base cursor-pointer rounded transition-all duration-300 shadow-[0_0_30px_rgba(208,255,20,0.3)] hover:bg-[#b8e612] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(208,255,20,0.5)] inline-block"
          >
            Start as Merchant
          </Link>
          <Link
            href="/explore"
            className="border border-border bg-transparent text-text-primary px-12 py-5 font-medium text-base cursor-pointer rounded transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:text-accent inline-block"
          >
            Explore Merchants
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex items-center justify-center gap-12 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 stroke-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Blockchain Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 stroke-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 stroke-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure & Transparent</span>
          </div>
        </div>
      </div>
    </section>
  );
}
