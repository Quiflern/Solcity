"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WalletModal from "@/components/wallet/WalletModal";

/**
 * MerchantNavbar Component
 *
 * Navigation bar for merchant-facing pages with wallet connection and route highlighting.
 * Provides navigation to merchant dashboard sections with active state indicators.
 *
 * Features:
 * - Solcity branding with "for Merchants" label
 * - Merchant navigation links (Dashboard, Register, Rules, Offers, Analytics, Profile)
 * - Active route highlighting with accent color
 * - Wallet connection button with dropdown menu
 * - Connected wallet display with formatted address
 * - Wallet actions: Copy address, Disconnect
 * - Toast notification for copy confirmation
 * - Click-outside detection to close dropdown
 * - Sticky positioning with backdrop blur
 */
export default function MerchantNavbar() {
  const pathname = usePathname();
  const { publicKey, disconnect } = useWallet();
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/merchant") return pathname === path;
    return pathname.startsWith(path);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setWalletDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = async () => {
    setWalletDropdownOpen(false);
    await disconnect();
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setWalletDropdownOpen(false);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  return (
    <>
      <nav className="h-[72px] border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="h-full max-w-[1400px] mx-auto px-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-wider flex gap-3 items-center"
          >
            <div className="w-3.5 h-3.5 bg-accent" />
            SOLCITY
            <span className="text-xs font-normal text-text-secondary">
              for Merchants
            </span>
          </Link>

          <div className="flex gap-10 items-center">
            <Link
              href="/merchant"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant") && pathname === "/merchant"
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/merchant/register"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant/register")
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Register
            </Link>
            <Link
              href="/merchant/rules"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant/rules")
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Rules
            </Link>
            <Link
              href="/merchant/offers"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant/offers")
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Offers
            </Link>
            <Link
              href="/merchant/analytics"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant/analytics")
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/merchant/profile"
              className={`text-sm font-medium transition-colors ${
                isActive("/merchant/profile")
                  ? "text-accent"
                  : "text-text-secondary hover:text-accent"
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Wallet Connection */}
          <div
            className="wallet-adapter-button-wrapper relative"
            ref={walletDropdownRef}
          >
            {publicKey ? (
              <>
                <button
                  type="button"
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="border border-accent bg-accent/5 text-accent px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2 hover:bg-accent/10 transition-colors"
                >
                  <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_#d0ff14]" />
                  <span>{formatAddress(publicKey.toString())}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${walletDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Dropdown Arrow</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {walletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-border rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                    <div className="p-5 border-b border-border bg-panel">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                          Connected Wallet
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_#d0ff14] animate-pulse" />
                          <span className="text-xs text-accent font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-xs text-text-primary break-all bg-black px-3 py-2.5 rounded border border-border leading-relaxed">
                        {publicKey.toString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="w-full px-5 py-3.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-3 text-text-primary group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-panel border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                        <svg
                          className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <title>Copy Icon</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Copy Address</div>
                        <div className="text-xs text-text-secondary">
                          Copy to clipboard
                        </div>
                      </div>
                    </button>
                    <div className="border-t border-border">
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="w-full px-5 py-3.5 text-left text-sm text-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 flex items-center justify-center group-hover:border-[#ff4d4d] transition-colors">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Disconnect Icon</title>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            Disconnect Wallet
                          </div>
                          <div className="text-xs text-[#ff4d4d]/70">
                            Sign out securely
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setWalletModalOpen(true)}
                className="border border-border bg-transparent text-text-primary px-6 py-2.5 text-sm font-semibold rounded hover:border-accent hover:bg-accent/5 transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      {showCopyToast && (
        <div className="fixed bottom-8 right-8 bg-panel border border-accent text-text-primary px-5 py-3 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 z-100000 animate-[slideIn_0.2s_ease-out]">
          <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Success Checkmark</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm font-medium">
            Address copied to clipboard
          </span>
        </div>
      )}
    </>
  );
}
