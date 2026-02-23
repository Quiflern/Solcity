import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { SolcityProtocol } from "./types/solcity_protocol";
import IDL_JSON from "./idl/solcity_protocol.json";

export const PROGRAM_ID = new PublicKey("67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9");

// Use devnet by default, can be overridden with environment variable
const DEFAULT_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl("devnet");

export function getProgram(provider: AnchorProvider) {
  return new Program<SolcityProtocol>(IDL_JSON as SolcityProtocol, provider);
}

export function getConnection(endpoint: string = DEFAULT_ENDPOINT) {
  return new Connection(endpoint, "confirmed");
}
