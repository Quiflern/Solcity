import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./setup";

/**
 * Derive the Loyalty Program PDA
 * Seeds: ["loyalty_program", authority]
 */
export function getLoyaltyProgramPDA(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("loyalty_program"), authority.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Mint PDA
 * Seeds: ["mint", loyalty_program]
 */
export function getMintPDA(loyaltyProgram: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), loyaltyProgram.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Merchant PDA
 * Seeds: ["merchant", authority, loyalty_program]
 */
export function getMerchantPDA(
  authority: PublicKey,
  loyaltyProgram: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("merchant"), authority.toBuffer(), loyaltyProgram.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Customer PDA
 * Seeds: ["customer", wallet, loyalty_program]
 */
export function getCustomerPDA(
  wallet: PublicKey,
  loyaltyProgram: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("customer"), wallet.toBuffer(), loyaltyProgram.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive the Reward Rule PDA
 * Seeds: ["reward_rule", merchant, rule_id]
 */
export function getRewardRulePDA(
  merchant: PublicKey,
  ruleId: bigint
): [PublicKey, number] {
  const ruleIdBuffer = Buffer.alloc(8);
  ruleIdBuffer.writeBigUInt64LE(ruleId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("reward_rule"), merchant.toBuffer(), ruleIdBuffer],
    PROGRAM_ID
  );
}
