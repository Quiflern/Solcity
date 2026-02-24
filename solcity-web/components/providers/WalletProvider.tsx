"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { type ReactNode, useMemo } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * WalletProvider Component
 *
 * Configures and provides Solana wallet adapter functionality to the entire application.
 * Sets up connection to Solana devnet and configures supported wallet adapters.
 *
 * Features:
 * - Connects to Solana devnet (configurable via NEXT_PUBLIC_RPC_ENDPOINT)
 * - Supports Solflare wallet adapter
 * - Auto-detects Phantom wallet via Standard Wallet protocol
 * - Enables auto-connect for better UX
 * - Provides wallet modal UI for wallet selection
 *
 * @param children - Child components that need access to wallet functionality
 */
export default function WalletProvider({ children }: { children: ReactNode }) {
  // Use devnet for deployment
  const _network = WalletAdapterNetwork.Devnet;

  // Use devnet endpoint (can be overridden with environment variable)
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl("devnet"),
    [],
  );

  // Configure supported wallets
  // Note: Phantom is now auto-detected via Standard Wallet protocol
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      // Phantom is automatically included via Standard Wallet detection
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
