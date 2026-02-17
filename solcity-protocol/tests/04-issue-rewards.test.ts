import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertBNEqual, assertTierEqual, assertError, assertBNGreaterThan } from "./helpers/assertions";

describe("Issue Rewards", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: PublicKey;
  let mintPda: PublicKey;
  let merchantKeypair: Keypair;
  let merchantPda: PublicKey;
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

    // Register customer
    customerKeypair = Keypair.generate();
    await airdrop(connection, customerKeypair.publicKey);

    [customerPda] = findProgramAddress(
      [SEEDS.CUSTOMER, customerKeypair.publicKey.toBuffer(), loyaltyProgramPda.toBuffer()],
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
  });

  it("Successfully issues rewards for a purchase", async () => {
    const { program } = await ctx;
    const purchaseAmount = 1000; // $10.00

    await program.methods
      .issueRewards(new anchor.BN(purchaseAmount))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
      })
      .signers([merchantKeypair])
      .rpc();

    const customer = await program.account.customer.fetch(customerPda);
    const expectedReward = (purchaseAmount * 10) / 100; // 100 tokens
    assertBNEqual(customer.totalEarned, expectedReward);
    assertBNEqual(customer.transactionCount, 1);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assertBNEqual(merchant.totalIssued, expectedReward);
  });

  it("Upgrades customer tier when threshold is reached", async () => {
    const { program } = await ctx;
    const purchaseAmount = 10000; // $100.00

    await program.methods
      .issueRewards(new anchor.BN(purchaseAmount))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
      })
      .signers([merchantKeypair])
      .rpc();

    const customer = await program.account.customer.fetch(customerPda);
    assertTierEqual(customer.tier, "silver"); // Should upgrade to Silver (1000+ tokens)
    assertBNGreaterThan(customer.totalEarned, 1000);
  });

  it("Fails when merchant is inactive", async () => {
    const { program } = await ctx;

    // Deactivate merchant
    await program.methods
      .updateMerchant(null, false)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    await assertError(
      () =>
        program.methods
          .issueRewards(new anchor.BN(1000))
          .accounts({
            merchantAuthority: merchantKeypair.publicKey,
            customer: customerPda,
            loyaltyProgram: loyaltyProgramPda,
            mint: mintPda,
            customerTokenAccount: customerTokenAccount,
          })
          .signers([merchantKeypair])
          .rpc(),
      "MerchantNotActive"
    );
  });
});
