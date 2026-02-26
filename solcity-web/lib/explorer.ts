/**
 * Solana Explorer URL utilities.
 *
 * This module provides functions to generate Solana Explorer URLs for
 * transactions and addresses. It automatically uses the correct cluster
 * based on the environment configuration.
 */

const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";

/**
 * Generates a Solana Explorer URL for a transaction or address.
 *
 * @param type - Type of explorer link ("tx" for transaction, "address" for account)
 * @param identifier - Transaction signature or account address
 * @param cluster - Solana cluster (default: from environment or "devnet")
 * @returns Full Solana Explorer URL
 *
 * @example
 * ```ts
 * const url = getExplorerUrl("tx", "5j7s6NiJS3JAkvgkoc18WVAsiSaci2pxB2A6ueCJP4tprA2TFg9wSyTLeYouxPBJEMzJinENTkpA52YStRW5Dia7");
 * // Returns: "https://explorer.solana.com/tx/5j7s...?cluster=devnet"
 * ```
 */
export function getExplorerUrl(
  type: "tx" | "address",
  identifier: string,
  cluster: string = CLUSTER,
): string {
  const baseUrl = "https://explorer.solana.com";

  // For devnet and mainnet, use the cluster parameter
  if (cluster === "devnet" || cluster === "mainnet-beta") {
    return `${baseUrl}/${type}/${identifier}?cluster=${cluster}`;
  }

  // For localnet/custom, use custom URL
  if (cluster === "localnet" || cluster === "localhost") {
    return `${baseUrl}/${type}/${identifier}?cluster=devnet`;
  }

  // Default to devnet
  return `${baseUrl}/${type}/${identifier}?cluster=devnet`;
}

/**
 * Generates a Solana Explorer URL for a transaction.
 *
 * @param signature - Transaction signature
 * @param cluster - Optional Solana cluster (default: from environment)
 * @returns Full Solana Explorer URL for the transaction
 *
 * @example
 * ```ts
 * const url = getTxExplorerUrl("5j7s6NiJS3JAkvgkoc18WVAsiSaci2pxB2A6ueCJP4tprA2TFg9wSyTLeYouxPBJEMzJinENTkpA52YStRW5Dia7");
 * ```
 */
export function getTxExplorerUrl(signature: string, cluster?: string): string {
  return getExplorerUrl("tx", signature, cluster);
}

/**
 * Generates a Solana Explorer URL for an address/account.
 *
 * @param address - Account public key address
 * @param cluster - Optional Solana cluster (default: from environment)
 * @returns Full Solana Explorer URL for the address
 *
 * @example
 * ```ts
 * const url = getAddressExplorerUrl("67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9");
 * ```
 */
export function getAddressExplorerUrl(
  address: string,
  cluster?: string,
): string {
  return getExplorerUrl("address", address, cluster);
}
