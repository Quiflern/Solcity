/**
 * Generate Solana Explorer URL for transactions and addresses
 * Automatically uses the correct cluster based on environment
 */

const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";

export function getExplorerUrl(
  type: "tx" | "address",
  identifier: string,
  cluster: string = CLUSTER
): string {
  const baseUrl = "https://explorer.solana.com";

  // For devnet and mainnet, use the cluster parameter
  if (cluster === "devnet" || cluster === "mainnet-beta") {
    return `${baseUrl}/${type}/${identifier}?cluster=${cluster}`;
  }

  // For localnet/custom, use custom URL
  if (cluster === "localnet" || cluster === "localhost") {
    return `${baseUrl}/${type}/${identifier}?cluster=custom&customUrl=http://localhost:8899`;
  }

  // Default to devnet
  return `${baseUrl}/${type}/${identifier}?cluster=devnet`;
}

export function getTxExplorerUrl(signature: string, cluster?: string): string {
  return getExplorerUrl("tx", signature, cluster);
}

export function getAddressExplorerUrl(address: string, cluster?: string): string {
  return getExplorerUrl("address", address, cluster);
}
