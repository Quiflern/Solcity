import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { setupTest, findProgramAddress, SEEDS } from "./helpers/setup";
import { assertPublicKeyEqual, assertBNEqual, assertError } from "./helpers/assertions";

describe("Initialize Program", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: anchor.web3.PublicKey;
  let mintPda: anchor.web3.PublicKey;

  const programName = "Test Loyalty Program";
  const interestRate = 500; // 5% APY

  it("Successfully initializes a loyalty program", async () => {
    const { program, authority } = await ctx;

    [loyaltyProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, authority.publicKey.toBuffer()],
      program.programId
    );

    [mintPda] = findProgramAddress(
      [SEEDS.MINT, loyaltyProgramPda.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeProgram(programName, interestRate)
      .accounts({
        authority: authority.publicKey,
      })
      .rpc();

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);

    assert.equal(loyaltyProgram.name, programName);
    assert.equal(loyaltyProgram.interestRate, interestRate);
    assertBNEqual(loyaltyProgram.totalMerchants, 0);
    assertBNEqual(loyaltyProgram.totalCustomers, 0);
    assertBNEqual(loyaltyProgram.totalTokensIssued, 0);
    assertBNEqual(loyaltyProgram.totalTokensRedeemed, 0);
    assertPublicKeyEqual(loyaltyProgram.authority, authority.publicKey);
    assertPublicKeyEqual(loyaltyProgram.mint, mintPda);
  });

  it("Fails to initialize with empty name", async () => {
    const { program, authority } = await ctx;

    const [newProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, anchor.web3.Keypair.generate().publicKey.toBuffer()],
      program.programId
    );

    const [newMintPda] = findProgramAddress(
      [SEEDS.MINT, newProgramPda.toBuffer()],
      program.programId
    );

    await assertError(
      () =>
        program.methods
          .initializeProgram("", interestRate)
          .accounts({
            authority: authority.publicKey,
          })
          .rpc(),
      "NameEmpty"
    );
  });

  it("Fails to initialize with name too long", async () => {
    const { program, authority } = await ctx;

    const longName = "A".repeat(33); // 33 characters

    const [newProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, anchor.web3.Keypair.generate().publicKey.toBuffer()],
      program.programId
    );

    const [newMintPda] = findProgramAddress(
      [SEEDS.MINT, newProgramPda.toBuffer()],
      program.programId
    );

    await assertError(
      () =>
        program.methods
          .initializeProgram(longName, interestRate)
          .accounts({
            authority: authority.publicKey,
          })
          .rpc(),
      "NameTooLong"
    );
  });

  it("Fails to initialize with invalid interest rate", async () => {
    const { program, authority } = await ctx;

    const invalidRate = 10001; // > 10000 (100%)

    const [newProgramPda] = findProgramAddress(
      [SEEDS.LOYALTY_PROGRAM, anchor.web3.Keypair.generate().publicKey.toBuffer()],
      program.programId
    );

    const [newMintPda] = findProgramAddress(
      [SEEDS.MINT, newProgramPda.toBuffer()],
      program.programId
    );

    await assertError(
      () =>
        program.methods
          .initializeProgram(programName, invalidRate)
          .accounts({
            authority: authority.publicKey,
          })
          .rpc(),
      "InvalidInterestRate"
    );
  });
});
