import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { SolcityProtocol } from "../../target/types/solcity_protocol";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export interface TestContext {
  provider: AnchorProvider;
  program: Program<SolcityProtocol>;
  connection: Connection;
  authority: anchor.Wallet;
}

export interface TestAccounts {
  loyaltyProgram: PublicKey;
  mint: PublicKey;
  merchant: PublicKey;
  merchantKeypair: Keypair;
  customer: PublicKey;
  customerKeypair: Keypair;
  customerTokenAccount: PublicKey;
}

export async function setupTest(): Promise<TestContext> {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolcityProtocol as Program<SolcityProtocol>;
  const authority = provider.wallet as anchor.Wallet;

  return {
    provider,
    program,
    connection: provider.connection,
    authority,
  };
}

export async function airdrop(
  connection: Connection,
  publicKey: PublicKey,
  amount: number = 2
): Promise<void> {
  const signature = await connection.requestAirdrop(
    publicKey,
    amount * anchor.web3.LAMPORTS_PER_SOL
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  });
}

export function findProgramAddress(
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

export const SEEDS = {
  LOYALTY_PROGRAM: Buffer.from("loyalty_program"),
  MINT: Buffer.from("mint"),
  MERCHANT: Buffer.from("merchant"),
  CUSTOMER: Buffer.from("customer"),
  REWARD_RULE: Buffer.from("reward_rule"),
};
