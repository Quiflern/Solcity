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

  // Show loading state only during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-text-secondary text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Always render children, let them handle wallet connection state
  return <>{children}</>;
}
