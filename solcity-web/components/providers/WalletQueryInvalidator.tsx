"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * WalletQueryInvalidator Component
 *
 * Automatically invalidates all React Query caches when the wallet connection changes.
 * This ensures that data is refetched when a user connects, disconnects, or switches wallets.
 *
 * Behavior:
 * - Watches for changes to the connected wallet's public key
 * - Invalidates all queries when wallet state changes
 * - Triggers automatic refetch of stale data
 * - Renders nothing (null component)
 */
export default function WalletQueryInvalidator() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  return null;
}
