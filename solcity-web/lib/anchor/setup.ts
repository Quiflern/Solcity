/**
 * Anchor program setup and configuration.
 *
 * This module provides utilities to initialize the Anchor program instance
 * and Solana connection for interacting with the Solcity protocol.
 */

import { type AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import IDL_JSON from "./idl/solcity_protocol.json";
import type { SolcityProtocol } from "./types/solcity_protocol";

/**
 * The Solcity protocol program ID on Solana.
 *
 * This is the deployed program address and must match the program ID
 * in the Rust code and Anchor.toml configuration.
 */
export const PROGRAM_ID = new PublicKey(
  "67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9",
);

/**
 * Default RPC endpoint.
 *
 * Uses the environment variable if set, otherwise defaults to devnet.
 */
const DEFAULT_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl("devnet");

/**
 * Creates an Anchor program instance for the Solcity protocol.
 *
 * @param provider - Anchor provider with wallet and connection
 * @returns Typed Anchor program instance
 *
 * @example
 * ```ts
 * const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
 * const program = getProgram(provider);
 *
 * // Use program to interact with the smart contract
 * const merchantAccount = await program.account.merchant.fetch(merchantPDA);
 * ```
 */
export function getProgram(provider: AnchorProvider) {
  return new Program<SolcityProtocol>(IDL_JSON as SolcityProtocol, provider);
}

/**
 * Creates a Solana connection instance.
 *
 * @param endpoint - Optional RPC endpoint URL (default: from environment or devnet)
 * @returns Solana connection instance with "confirmed" commitment
 *
 * @example
 * ```ts
 * const connection = getConnection();
 * const balance = await connection.getBalance(publicKey);
 * ```
 */
export function getConnection(endpoint: string = DEFAULT_ENDPOINT) {
  return new Connection(endpoint, "confirmed");
}
