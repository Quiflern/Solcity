"use client";

import { useEffect, useState } from "react";

/**
 * ProtectedRoute Component
 *
 * A wrapper component that handles client-side hydration for wallet-protected routes.
 * Prevents hydration mismatches by showing a loading state during SSR, then renders
 * children on the client. The actual wallet connection check is delegated to child
 * components for more flexible authentication flows.
 *
 * Features:
 * - Client-side only rendering to avoid SSR/hydration issues
 * - Loading spinner during initial mount
 * - Delegates wallet connection state to child components
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
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
