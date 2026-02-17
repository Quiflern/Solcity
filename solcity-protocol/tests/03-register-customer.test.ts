import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertPublicKeyEqual, assertBNEqual, assertTierEqual } from "./helpers/assertions";

describe("Register Customer", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: PublicKey;
  let mintPda: PublicKey;
  let customerKeypair: Keypair;
  let customerPda: PublicKey;
  let customerTokenAccount: PublicKey;

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

    // Setup customer keypair
    customerKeypair = Keypair.generate();
    await airdrop(connection, customerKeypair.publicKey);
  });

  it("Successfully registers a customer", async () => {
    const { program } = await ctx;

    [customerPda] = findProgramAddress(
      [
        SEEDS.CUSTOMER,
        customerKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    customerTokenAccount = getAssociatedTokenAddressSync(
      mintPda,
      customerKeypair.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    await program.methods
      .registerCustomer()
      .accounts({
        customerAuthority: customerKeypair.publicKey,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([customerKeypair])
      .rpc();

    const customer = await program.account.customer.fetch(customerPda);

    assertPublicKeyEqual(customer.wallet, customerKeypair.publicKey);
    assertPublicKeyEqual(customer.loyaltyProgram, loyaltyProgramPda);
    assertBNEqual(customer.totalEarned, 0);
    assertBNEqual(customer.totalRedeemed, 0);
    assertTierEqual(customer.tier, "bronze");
    assertBNEqual(customer.transactionCount, 0);
    assert.equal(customer.streakDays, 0);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
    assertBNEqual(loyaltyProgram.totalCustomers, 1);
  });

  it("Creates associated token account if needed", async () => {
    const { connection } = await ctx;

    const tokenAccountInfo = await connection.getAccountInfo(customerTokenAccount);
    assert.isNotNull(tokenAccountInfo, "Token account should exist");
  });

  it("Allows multiple customers to register", async () => {
    const { program, connection } = await ctx;

    const customer2Keypair = Keypair.generate();
    await airdrop(connection, customer2Keypair.publicKey);

    const [customer2Pda] = findProgramAddress(
      [
        SEEDS.CUSTOMER,
        customer2Keypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    const customer2TokenAccount = getAssociatedTokenAddressSync(
      mintPda,
      customer2Keypair.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    await program.methods
      .registerCustomer()
      .accounts({
        customerAuthority: customer2Keypair.publicKey,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([customer2Keypair])
      .rpc();

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
    assertBNEqual(loyaltyProgram.totalCustomers, 2);
  });
});
