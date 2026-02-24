"use client";

import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Custom hook to access wallet information and utilities.
 *
 * This hook provides convenient access to wallet connection state and
 * formatted wallet addresses. It wraps the Solana wallet adapter and
 * adds utility functions for displaying wallet addresses in a user-friendly
 * format.
 *
 * @returns {Object} Wallet information and utilities
 * @returns {PublicKey|null} publicKey - The wallet's public key, or null if not connected
 * @returns {string} walletAddress - Full wallet address as a string, or empty string if not connected
 * @returns {string} shortAddress - Shortened wallet address (e.g., "AbC1...XyZ9"), or empty string if not connected
 * @returns {boolean} connected - Whether the wallet is currently connected
 * @returns {boolean} connecting - Whether the wallet is in the process of connecting
 * @returns {Function} disconnect - Function to disconnect the wallet
 * @returns {boolean} isWalletConnected - Alias for connected (for convenience)
 *
 * @example
 * ```tsx
 * const { shortAddress, connected, disconnect } = useWalletInfo();
 *
 * if (!connected) {
 *   return <div>Please connect your wallet</div>;
 * }
 *
 * return (
 *   <div>
 *     <p>Connected: {shortAddress}</p>
 *     <button onClick={disconnect}>Disconnect</button>
 *   </div>
 * );
 * ```
 */
export function useWalletInfo() {
  const { publicKey, connected, connecting, disconnect } = useWallet();

  /**
   * Formats a wallet address to a shortened version.
   *
   * @param address - Full wallet address
   * @param chars - Number of characters to show at start and end (default: 4)
   * @returns Formatted address (e.g., "AbC1...XyZ9")
   */
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
