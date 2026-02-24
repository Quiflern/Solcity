/**
 * Program Derived Address (PDA) utilities for the Solcity protocol.
 *
 * This module provides functions to derive PDAs for all account types
 * in the Solcity loyalty program. PDAs are deterministic addresses
 * derived from seeds and the program ID.
 *
 * All PDA derivation functions must use the same seeds as defined in
 * the Rust program to ensure consistency.
 */

import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./setup";

/**
 * Derives the Loyalty Program PDA.
 *
 * The loyalty program is the top-level account that manages the entire
 * loyalty system for a program authority.
 *
 * Seeds: ["loyalty_program", authority]
 *
 * @param authority - Public key of the program authority
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [loyaltyProgramPDA, bump] = getLoyaltyProgramPDA(authorityPublicKey);
 * ```
 */
export function getLoyaltyProgramPDA(
  authority: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("loyalty_program"), authority.toBuffer()],
    PROGRAM_ID,
  );
}

/**
 * Derives the Mint PDA.
 *
 * The mint account is the SPL token mint for the loyalty program's tokens.
 *
 * Seeds: ["mint", loyalty_program]
 *
 * @param loyaltyProgram - Public key of the loyalty program
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [mintPDA, bump] = getMintPDA(loyaltyProgramPDA);
 * ```
 */
export function getMintPDA(loyaltyProgram: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), loyaltyProgram.toBuffer()],
    PROGRAM_ID,
  );
}

/**
 * Derives the Merchant PDA.
 *
 * Each merchant has a unique account within the loyalty program.
 *
 * Seeds: ["merchant", authority, loyalty_program]
 *
 * @param authority - Public key of the merchant's authority wallet
 * @param loyaltyProgram - Public key of the loyalty program
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [merchantPDA, bump] = getMerchantPDA(merchantAuthority, loyaltyProgramPDA);
 * ```
 */
export function getMerchantPDA(
  authority: PublicKey,
  loyaltyProgram: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("merchant"), authority.toBuffer(), loyaltyProgram.toBuffer()],
    PROGRAM_ID,
  );
}

/**
 * Derives the Customer PDA.
 *
 * Each customer has a unique account within the loyalty program.
 *
 * Seeds: ["customer", wallet, loyalty_program]
 *
 * @param wallet - Public key of the customer's wallet
 * @param loyaltyProgram - Public key of the loyalty program
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [customerPDA, bump] = getCustomerPDA(customerWallet, loyaltyProgramPDA);
 * ```
 */
export function getCustomerPDA(
  wallet: PublicKey,
  loyaltyProgram: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("customer"), wallet.toBuffer(), loyaltyProgram.toBuffer()],
    PROGRAM_ID,
  );
}

/**
 * Derives the Reward Rule PDA.
 *
 * Reward rules define special conditions that modify loyalty point calculations.
 * Each rule is identified by a unique rule ID within a merchant's account.
 *
 * Seeds: ["reward_rule", merchant, rule_id]
 *
 * @param merchant - Public key of the merchant account
 * @param ruleId - Unique identifier for the rule (u64)
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [rewardRulePDA, bump] = getRewardRulePDA(merchantPDA, 1);
 * ```
 */
export function getRewardRulePDA(
  merchant: PublicKey,
  ruleId: number,
): [PublicKey, number] {
  // Convert number to u64 little-endian bytes
  const ruleIdBuffer = new Uint8Array(8);
  const view = new DataView(ruleIdBuffer.buffer);
  view.setBigUint64(0, BigInt(ruleId), true); // true = little-endian

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("reward_rule"),
      merchant.toBuffer(),
      Buffer.from(ruleIdBuffer),
    ],
    PROGRAM_ID,
  );
}

/**
 * Derives the Redemption Offer PDA.
 *
 * Redemption offers are rewards that customers can redeem using loyalty points.
 * Each offer is identified by a unique name within a merchant's account.
 *
 * Seeds: ["redemption_offer", merchant, name]
 *
 * @param merchant - Public key of the merchant account
 * @param name - Unique name for the redemption offer
 * @returns Tuple of [PDA PublicKey, bump seed]
 *
 * @example
 * ```ts
 * const [offerPDA, bump] = getRedemptionOfferPDA(merchantPDA, "10% Discount");
 * ```
 */
export function getRedemptionOfferPDA(
  merchant: PublicKey,
  name: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("redemption_offer"), merchant.toBuffer(), Buffer.from(name)],
    PROGRAM_ID,
  );
}
