"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const { connected, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connecting && !connected) {
      router.push(redirectTo);
    }
  }, [connected, connecting, router, redirectTo]);

  // Show loading state while checking connection
  if (connecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-text-secondary text-sm font-medium">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  // Show message if not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-8">
          <div className="w-20 h-20 bg-panel border border-border rounded-xl flex items-center justify-center mx-auto mb-6">
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
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-accent text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-[#b8e612] transition-all hover:-translate-y-0.5 shadow-[0_0_20px_rgba(208,255,20,0.3)]"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
