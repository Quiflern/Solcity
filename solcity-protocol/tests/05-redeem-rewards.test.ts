import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertBNEqual, assertError } from "./helpers/assertions";

describe("Redeem Rewards", () => {
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

    // Issue some rewards first
    await program.methods
      .issueRewards(new anchor.BN(10000))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
      })
      .signers([merchantKeypair])
      .rpc();
  });

  it("Successfully redeems rewards", async () => {
    const { program } = await ctx;
    const redeemAmount = 50;

    await program.methods
      .redeemRewards(new anchor.BN(redeemAmount), { discount: { percentage: 10 } })
      .accounts({
        customerAuthority: customerKeypair.publicKey,
        merchant: merchantPda,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([customerKeypair])
      .rpc();

    const customer = await program.account.customer.fetch(customerPda);
    assertBNEqual(customer.totalRedeemed, redeemAmount);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assertBNEqual(merchant.totalRedeemed, redeemAmount);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
    assertBNEqual(loyaltyProgram.totalTokensRedeemed, redeemAmount);
  });

  it("Fails to redeem with insufficient balance", async () => {
    const { program } = await ctx;
    const customer = await program.account.customer.fetch(customerPda);
    const balance = customer.totalEarned.sub(customer.totalRedeemed);
    const excessiveAmount = balance.add(new anchor.BN(1000));

    await assertError(
      () =>
        program.methods
          .redeemRewards(excessiveAmount, { discount: { percentage: 10 } })
          .accounts({
            customerAuthority: customerKeypair.publicKey,
            merchant: merchantPda,
            loyaltyProgram: loyaltyProgramPda,
          })
          .signers([customerKeypair])
          .rpc(),
      "InsufficientBalance"
    );
  });

  it("Fails to redeem zero amount", async () => {
    const { program } = await ctx;

    await assertError(
      () =>
        program.methods
          .redeemRewards(new anchor.BN(0), { discount: { percentage: 10 } })
          .accounts({
            customerAuthority: customerKeypair.publicKey,
            merchant: merchantPda,
            loyaltyProgram: loyaltyProgramPda,
          })
          .signers([customerKeypair])
          .rpc(),
      "InvalidRewardAmount"
    );
  });

  it("Supports different redemption types", async () => {
    const { program } = await ctx;

    // Test cashback redemption
    await program.methods
      .redeemRewards(new anchor.BN(25), { cashback: { amountLamports: new anchor.BN(1000000) } })
      .accounts({
        customerAuthority: customerKeypair.publicKey,
        merchant: merchantPda,
        loyaltyProgram: loyaltyProgramPda,
      })
      .signers([customerKeypair])
      .rpc();

    const customer = await program.account.customer.fetch(customerPda);
    assertBNEqual(customer.totalRedeemed, 75); // 50 + 25
  });
});
