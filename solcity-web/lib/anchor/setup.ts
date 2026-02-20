import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolcityProtocol } from "./idl/solcity_protocol";
import IDL_JSON from "./idl/solcity_protocol.json";

export const PROGRAM_ID = new PublicKey("67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9");

export function getProgram(provider: AnchorProvider) {
  return new Program<SolcityProtocol>(IDL_JSON as SolcityProtocol, provider);
}

export function getConnection(endpoint: string = "http://localhost:8899") {
  return new Connection(endpoint, "confirmed");
}
