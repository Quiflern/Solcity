"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { connected, connecting } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and while checking connection
  if (!isClient || connecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-text-secondary text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if not connected (but don't redirect)
  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-8">
          <div className="w-20 h-20 bg-panel border border-border flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 stroke-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Wallet Required</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Please connect your Solana wallet to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
