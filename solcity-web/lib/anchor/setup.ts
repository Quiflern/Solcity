import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "./solcity_protocol.json";

export const PROGRAM_ID = new PublicKey("67XD1wBu5Ja1H5e4Zg4vsjZDoAcB8KwTZqawodZZwqv9");

export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as Idl, provider);
}

export function getConnection(endpoint: string = "http://localhost:8899") {
  return new Connection(endpoint, "confirmed");
}
