"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export function useWalletInfo() {
  const { publicKey, connected, connecting, disconnect } = useWallet();

  const formatAddress = (address: string, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  const walletAddress = publicKey?.toString() || "";
  const shortAddress = walletAddress ? formatAddress(walletAddress) : "";

  return {
    publicKey,
    walletAddress,
    shortAddress,
    connected,
    connecting,
    disconnect,
    isWalletConnected: connected,
  };
}
