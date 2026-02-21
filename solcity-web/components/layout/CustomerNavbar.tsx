"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useRef, useEffect } from "react";
import WalletModal from "@/components/wallet/WalletModal";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const { publicKey, disconnect } = useWallet();
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === "/customer") return pathname === path;
    return pathname.startsWith(path);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
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
          <Link href="/" className="text-lg font-bold tracking-wider flex gap-3 items-center">
            <div className="w-3.5 h-3.5 bg-accent" />
            SOLCITY
          </Link>

          <div className="flex gap-10 items-center">
            <Link
              href="/customer"
              className={`text-sm font-medium transition-colors ${isActive("/customer") && pathname === "/customer" ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/customer/explore"
              className={`text-sm font-medium transition-colors ${isActive("/customer/explore") ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              Explore
            </Link>
            <Link
              href="/customer/history"
              className={`text-sm font-medium transition-colors ${isActive("/customer/history") ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              History
            </Link>
            <Link
              href="/customer/redeem"
              className={`text-sm font-medium transition-colors ${isActive("/customer/redeem") ? "text-accent" : "text-text-secondary hover:text-accent"
                }`}
            >
              Redeem
            </Link>
            <Link
              href="/merchant"
              className="text-sm font-medium text-text-secondary hover:text-accent transition-colors flex items-center gap-1"
            >
              Merchant View
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Wallet Connection */}
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

                {walletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-border rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50">
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
                      href="/customer/profile"
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
                    <Link
                      href="/customer/settings"
                      onClick={() => setWalletDropdownOpen(false)}
                      className="w-full px-5 py-3.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-3 text-text-primary group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-panel border border-border flex items-center justify-center group-hover:border-accent transition-colors">
                        <svg className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Settings</div>
                        <div className="text-xs text-text-secondary">Manage preferences</div>
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

      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />

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
