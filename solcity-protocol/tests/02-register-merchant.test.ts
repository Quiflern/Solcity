import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertPublicKeyEqual, assertBNEqual, assertError } from "./helpers/assertions";

describe("Register Merchant", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: anchor.web3.PublicKey;
  let mintPda: anchor.web3.PublicKey;
  let merchantKeypair: Keypair;
  let merchantPda: anchor.web3.PublicKey;

  const programName = "Test Loyalty Program";
  const merchantName = "Test Coffee Shop";
  const rewardRate = 10; // 10 tokens per $1

  before(async () => {
    const { program, authority, connection } = await ctx;

    // Initialize program first
    [loyaltyProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, authority.publicKey.toBuffer()],
      program.programId
    );

    [mintPda] = findProgramAddress(
      [SEEDS.MINT, loyaltyProgramPda.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeProgram(programName, 500)
      .accounts({
        authority: authority.publicKey,
      })
      .rpc();

    // Setup merchant keypair
    merchantKeypair = Keypair.generate();
    await airdrop(connection, merchantKeypair.publicKey);
  });

  it("Successfully registers a merchant", async () => {
    const { program } = await ctx;

    [merchantPda] = findProgramAddress(
      [
        SEEDS.MERCHANT,
        merchantKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .registerMerchant(merchantName, new anchor.BN(rewardRate))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([merchantKeypair])
      .rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);

    assert.equal(merchant.name, merchantName);
    assertBNEqual(merchant.rewardRate, rewardRate);
    assert.equal(merchant.isActive, true);
    assertBNEqual(merchant.totalIssued, 0);
    assertBNEqual(merchant.totalRedeemed, 0);
    assertPublicKeyEqual(merchant.authority, merchantKeypair.publicKey);
    assertPublicKeyEqual(merchant.loyaltyProgram, loyaltyProgramPda);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
    assertBNEqual(loyaltyProgram.totalMerchants, 1);
  });

  it("Fails to register merchant with empty name", async () => {
    const { program, connection } = await ctx;

    const newMerchantKeypair = Keypair.generate();
    await airdrop(connection, newMerchantKeypair.publicKey);

    const [newMerchantPda] = findProgramAddress(
      [
        SEEDS.MERCHANT,
        newMerchantKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    await assertError(
      () =>
        program.methods
          .registerMerchant("", new anchor.BN(rewardRate))
          .accounts({
            merchantAuthority: newMerchantKeypair.publicKey,
            loyaltyProgram: loyaltyProgramPda,
          })
          .signers([newMerchantKeypair])
          .rpc(),
      "NameEmpty"
    );
  });

  it("Fails to register merchant with name too long", async () => {
    const { program, connection } = await ctx;

    const newMerchantKeypair = Keypair.generate();
    await airdrop(connection, newMerchantKeypair.publicKey);

    const [newMerchantPda] = findProgramAddress(
      [
        SEEDS.MERCHANT,
        newMerchantKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    const longName = "A".repeat(33);

    await assertError(
      () =>
        program.methods
          .registerMerchant(longName, new anchor.BN(rewardRate))
          .accounts({
            merchantAuthority: newMerchantKeypair.publicKey,
            loyaltyProgram: loyaltyProgramPda,
          })
          .signers([newMerchantKeypair])
          .rpc(),
      "NameTooLong"
    );
  });

  it("Fails to register merchant with zero reward rate", async () => {
    const { program, connection } = await ctx;

    const newMerchantKeypair = Keypair.generate();
    await airdrop(connection, newMerchantKeypair.publicKey);

    const [newMerchantPda] = findProgramAddress(
      [
        SEEDS.MERCHANT,
        newMerchantKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    await assertError(
      () =>
        program.methods
          .registerMerchant(merchantName, new anchor.BN(0))
          .accounts({
            merchantAuthority: newMerchantKeypair.publicKey,
            loyaltyProgram: loyaltyProgramPda,
          })
          .signers([newMerchantKeypair])
          .rpc(),
      "InvalidRewardAmount"
    );
  });

  it("Allows multiple merchants to register", async () => {
    const { program, connection } = await ctx;

    const merchant2Keypair = Keypair.generate();
    await airdrop(connection, merchant2Keypair.publicKey);

    const [merchant2Pda] = findProgramAddress(
      [
        SEEDS.MERCHANT,
        merchant2Keypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .registerMerchant("Second Merchant", new anchor.BN(15))
      .accounts({
        merchantAuthority: merchant2Keypair.publicKey,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([merchant2Keypair])
      .rpc();

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
    assertBNEqual(loyaltyProgram.totalMerchants, 2);
  });
});
