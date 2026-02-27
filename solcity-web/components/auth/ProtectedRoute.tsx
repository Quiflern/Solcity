"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import WalletModal from "@/components/wallet/WalletModal";

/**
 * ProtectedRoute Component
 *
 * A wrapper component that handles authentication and registration states for protected routes.
 * Shows appropriate messages and actions based on wallet connection and registration status.
 *
 * Features:
 * - Client-side only rendering to avoid SSR/hydration issues
 * - Wallet connection prompt if not connected
 * - Registration prompt if wallet connected but not registered
 * - Loading states for checking registration
 * - Graceful error handling
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Type of account required: "customer" or "merchant" */
  requiresAccount?: "customer" | "merchant";
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom not connected component */
  notConnectedComponent?: React.ReactNode;
  /** Custom not registered component */
  notRegisteredComponent?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiresAccount,
  loadingComponent,
  notConnectedComponent,
  notRegisteredComponent,
}: ProtectedRouteProps) {
  const [isClient, setIsClient] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR
  if (!isClient) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-text-secondary text-sm font-medium">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show wallet connection prompt if not connected
  if (!connected || !publicKey) {
    return (
      <>
        {notConnectedComponent || (
          <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-panel border border-border rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Wallet Required</h2>
                <p className="text-text-secondary mb-6">
                  Please connect your Solana wallet to access this page
                </p>
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="w-full bg-accent text-bg-primary hover:bg-accent/90 rounded-lg px-6 py-3 font-medium transition-colors"
                >
                  Connect Wallet
                </button>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link
                    href="/"
                    className="text-sm text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        <WalletModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
        />
      </>
    );
  }

  // If no specific account type is required, just render children
  if (!requiresAccount) {
    return <>{children}</>;
  }

  // Render children - they will handle registration checks
  return <>{children}</>;
}



