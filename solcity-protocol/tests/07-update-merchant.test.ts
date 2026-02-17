import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertBNEqual, assertError } from "./helpers/assertions";
import { assert } from "chai";

describe("Update Merchant", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: PublicKey;
  let mintPda: PublicKey;
  let merchantKeypair: Keypair;
  let merchantPda: PublicKey;

  before(async () => {
    const { program, authority, connection } = await ctx;

    // Initialize program
    [loyaltyProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, authority.publicKey.toBuffer()],
      program.programId
    );

    [mintPda] = findProgramAddress(
      [SEEDS.MINT, loyaltyProgramPda.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeProgram("Test Program", 500)
      .accounts({
        authority: authority.publicKey,
      })
      .rpc();

    // Register merchant
    merchantKeypair = Keypair.generate();
    await airdrop(connection, merchantKeypair.publicKey);

    [merchantPda] = findProgramAddress(
      [SEEDS.MERCHANT, merchantKeypair.publicKey.toBuffer(), loyaltyProgramPda.toBuffer()],
      program.programId
    );

    await program.methods
      .registerMerchant("Test Merchant", new anchor.BN(10))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([merchantKeypair])
      .rpc();
  });

  it("Successfully updates reward rate", async () => {
    const { program } = await ctx;
    const newRewardRate = 15;

    await program.methods
      .updateMerchant(new anchor.BN(newRewardRate), null)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);
    assertBNEqual(merchant.rewardRate, newRewardRate);
  });

  it("Successfully deactivates merchant", async () => {
    const { program } = await ctx;

    await program.methods
      .updateMerchant(null, false)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.isActive, false);
  });

  it("Successfully reactivates merchant", async () => {
    const { program } = await ctx;

    await program.methods
      .updateMerchant(null, true)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.isActive, true);
  });

  it("Successfully updates both reward rate and status", async () => {
    const { program } = await ctx;
    const newRewardRate = 20;

    await program.methods
      .updateMerchant(new anchor.BN(newRewardRate), false)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    const merchant = await program.account.merchant.fetch(merchantPda);
    assertBNEqual(merchant.rewardRate, newRewardRate);
    assert.equal(merchant.isActive, false);
  });

  it("Fails to update with zero reward rate", async () => {
    const { program } = await ctx;

    await assertError(
      () =>
        program.methods
          .updateMerchant(new anchor.BN(0), null)
          .accounts({
            merchantAuthority: merchantKeypair.publicKey,
          })
          .signers([merchantKeypair])
          .rpc(),
      "InvalidRewardAmount"
    );
  });

  it("Fails when unauthorized signer tries to update", async () => {
    const { program, connection } = await ctx;
    const unauthorizedKeypair = Keypair.generate();
    await airdrop(connection, unauthorizedKeypair.publicKey);

    await assertError(
      () =>
        program.methods
          .updateMerchant(new anchor.BN(25), null)
          .accounts({
            merchantAuthority: unauthorizedKeypair.publicKey,
          })
          .signers([unauthorizedKeypair])
          .rpc(),
      "ConstraintSeeds"
    );
  });
});
