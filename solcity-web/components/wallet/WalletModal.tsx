"use client";

import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * WalletModal Component
 *
 * Modal dialog for selecting and connecting Solana wallets.
 * Provides a user-friendly interface for wallet selection with animations.
 *
 * Features:
 * - Lists installed and available Solana wallets
 * - Animated modal with backdrop blur
 * - Wallet detection (shows "Detected" badge for installed wallets)
 * - Connection status with visual feedback
 * - Expand/collapse to show more wallet options
 * - Escape key to close
 * - Auto-closes on successful connection
 * - Animated selection states and transitions
 *
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when modal should close
 */

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallets, select, connect, connected, connecting } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleWalletClick = async (walletName: WalletName) => {
    try {
      setSelectedWallet(walletName);

      // Select the wallet and wait for it to be ready
      select(walletName);

      // Wait a bit for the wallet to be selected before connecting
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Then try to connect
      try {
        await connect();
      } catch (connectError: unknown) {
        // User might have rejected the connection
        console.log("Connection cancelled or failed:", connectError);
        setSelectedWallet(null);
      }
    } catch (error) {
      console.error("Error selecting wallet:", error);
      setSelectedWallet(null);
    }
  };

  // Close modal when wallet successfully connects
  useEffect(() => {
    if (connected && isOpen) {
      // Close after showing success animation
      const timer = setTimeout(() => {
        onClose();
        setSelectedWallet(null);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [connected, isOpen, onClose]);

  const installedWallets = wallets.filter(
    (wallet) => wallet.readyState === "Installed",
  );
  const notInstalledWallets = wallets.filter(
    (wallet) => wallet.readyState !== "Installed",
  );
  const displayWallets = expanded ? wallets : installedWallets.slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
          style={{
            zIndex: 99999,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[#0a0a0a] border border-border rounded-xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                Connect a wallet on Solana to continue
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Close</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Wallet List */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <motion.div className="flex flex-col gap-3" layout>
                <AnimatePresence mode="popLayout">
                  {displayWallets.map((wallet) => {
                    const isInstalled = wallet.readyState === "Installed";
                    const isSelected = selectedWallet === wallet.adapter.name;
                    return (
                      <motion.button
                        key={wallet.adapter.name}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: isSelected ? 0.98 : 1,
                          backgroundColor: isSelected
                            ? "rgba(208, 255, 20, 0.1)"
                            : "rgba(17, 17, 17, 1)",
                        }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => handleWalletClick(wallet.adapter.name)}
                        disabled={connecting || isSelected}
                        className={`flex items-center gap-4 p-4 bg-panel border rounded-lg transition-all disabled:cursor-not-allowed group relative overflow-hidden ${
                          isSelected
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent hover:bg-accent/5"
                        }`}
                      >
                        {/* Selection pulse effect */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 bg-accent/20"
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                        )}

                        <img
                          src={wallet.adapter.icon}
                          alt={wallet.adapter.name}
                          className="w-10 h-10 rounded-lg relative z-10"
                        />
                        <span
                          className={`flex-1 text-left font-medium transition-colors relative z-10 ${
                            isSelected
                              ? "text-accent"
                              : "text-text-primary group-hover:text-accent"
                          }`}
                        >
                          {wallet.adapter.name}
                        </span>
                        {isInstalled && !isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-text-secondary font-medium px-2 py-1 bg-accent/10 rounded relative z-10"
                          >
                            Detected
                          </motion.span>
                        )}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-6 h-6 bg-accent rounded-full flex items-center justify-center relative z-10"
                          >
                            <svg
                              className="w-4 h-4 text-black"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <title>Connected</title>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </motion.div>

              {/* More Options Button */}
              {!expanded &&
                (installedWallets.length > 3 ||
                  notInstalledWallets.length > 0) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="w-full mt-4 p-3 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent transition-all flex items-center justify-center gap-2"
                  >
                    <span>More options</span>
                    <motion.svg
                      animate={{ y: [0, 2, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Expand</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>
                )}

              {/* Collapse Button */}
              {expanded && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="w-full mt-4 p-3 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-accent transition-all flex items-center justify-center gap-2"
                >
                  <span>Less options</span>
                  <motion.svg
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="w-4 h-4 rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Collapse</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
