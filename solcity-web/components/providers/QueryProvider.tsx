"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider Component
 *
 * Provides React Query (TanStack Query) context to the application for data fetching
 * and caching. Configures default query options for consistent behavior.
 *
 * Configuration:
 * - Stale time: 1 minute (data considered fresh for 60 seconds)
 * - Refetch on window focus: Disabled (prevents unnecessary refetches)
 *
 * @param children - Child components that need access to React Query
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
