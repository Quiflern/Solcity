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
  ruleId: number
): [PublicKey, number] {
  // Convert number to u64 little-endian bytes
  const ruleIdBuffer = new Uint8Array(8);
  const view = new DataView(ruleIdBuffer.buffer);
  view.setBigUint64(0, BigInt(ruleId), true); // true = little-endian

  return PublicKey.findProgramAddressSync(
    [Buffer.from("reward_rule"), merchant.toBuffer(), Buffer.from(ruleIdBuffer)],
    PROGRAM_ID
  );
}

/**
 * Derive the Redemption Offer PDA
 * Seeds: ["redemption_offer", merchant, name]
 */
export function getRedemptionOfferPDA(
  merchant: PublicKey,
  name: string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("redemption_offer"), merchant.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}
