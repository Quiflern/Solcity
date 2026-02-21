"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WalletModal from "@/components/wallet/WalletModal";

export default function Navbar() {
  const pathname = usePathname();
  const { publicKey, disconnect } = useWallet();
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const businessDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  // Format wallet address to show 8 characters on each side (16 total)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setWalletDropdownOpen(false);
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setBusinessDropdownOpen(false);
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
          <Link href="/" className="text-lg font-bold tracking-wider flex gap-3 items-center">
            <div className="w-3.5 h-3.5 bg-accent" />
            SOLCITY
          </Link>

          <div className="flex gap-10 items-center">
            <Link
              href="/customer/explore"
              className={`text-sm font-medium transition-colors ${isActive("/customer/explore") ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              Explore
            </Link>
            <Link
              href="/customer"
              className={`text-sm font-medium transition-colors ${isActive("/customer") ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              Dashboard
            </Link>

            {/* For Businesses Dropdown */}
            <div
              className="relative"
              ref={businessDropdownRef}
              onMouseEnter={() => setBusinessDropdownOpen(true)}
              onMouseLeave={() => setBusinessDropdownOpen(false)}
            >
              <button
                type="button"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive("/merchant") ? "text-accent" : "text-text-secondary hover:text-accent"
                  }`}
              >
                For Businesses
                <motion.svg
                  animate={{ rotate: businessDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {/* Business Dropdown Menu */}
              <AnimatePresence>
                {businessDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 mt-2 w-52 bg-[#0a0a0a] border border-border rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                  >
                    <Link
                      href="/merchant"
                      className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors text-text-primary"
                    >
                      <div className="font-medium">Merchant Dashboard</div>
                      <div className="text-xs text-text-secondary">Issue rewards</div>
                    </Link>
                    <Link
                      href="/merchant/register"
                      className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors text-text-primary"
                    >
                      <div className="font-medium">Register Business</div>
                      <div className="text-xs text-text-secondary">Get started</div>
                    </Link>
                    <Link
                      href="/merchant/analytics"
                      className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors text-text-primary"
                    >
                      <div className="font-medium">View Analytics</div>
                      <div className="text-xs text-text-secondary">Track performance</div>
                    </Link>
                    <Link
                      href="/merchant/rules"
                      className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors text-text-primary"
                    >
                      <div className="font-medium">Manage Rules</div>
                      <div className="text-xs text-text-secondary">Configure rewards</div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Wallet Connection Button */}
          <div className="wallet-adapter-button-wrapper relative" ref={walletDropdownRef}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Wallet Dropdown Menu */}
                {walletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-[#0a0a0a] border border-border rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                    <div className="p-5 border-b border-border bg-panel">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Connected Wallet</div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_#d0ff14] animate-pulse" />
                          <span className="text-xs text-accent font-medium">Active</span>
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
                        <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Copy Address</div>
                        <div className="text-xs text-text-secondary">Copy to clipboard</div>
                      </div>
                    </button>
                    <Link
                      href="/profile"
                      onClick={() => setWalletDropdownOpen(false)}
                      className="w-full px-5 py-3.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-3 text-text-primary group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-panel border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                        <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Profile</div>
                        <div className="text-xs text-text-secondary">View your profile</div>
                      </div>
                    </Link>
                    <div className="border-t border-border">
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="w-full px-5 py-3.5 text-left text-sm text-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-colors flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 flex items-center justify-center group-hover:border-[#ff4d4d] transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Disconnect Wallet</div>
                          <div className="text-xs text-[#ff4d4d]/70">Sign out securely</div>
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

      {/* Custom Wallet Modal */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="fixed bottom-8 right-8 bg-panel border border-accent text-text-primary px-5 py-3 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 z-100000 animate-[slideIn_0.2s_ease-out]">
          <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium">Address copied to clipboard</span>
        </div>
      )}
    </>
  );
}
