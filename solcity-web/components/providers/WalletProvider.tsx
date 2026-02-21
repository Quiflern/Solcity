"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, ReactNode } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletProvider({ children }: { children: ReactNode }) {
  // Use localhost for development with local validator
  const network = WalletAdapterNetwork.Devnet;

  // Use localhost for local testing
  const endpoint = useMemo(() => "http://localhost:8899", []);

  // Configure supported wallets
  // Note: Phantom is now auto-detected via Standard Wallet protocol
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      // Phantom is automatically included via Standard Wallet detection
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
