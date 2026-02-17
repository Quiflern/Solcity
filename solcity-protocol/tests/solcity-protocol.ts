import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolcityProtocol } from "../target/types/solcity_protocol";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("solcity-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolcityProtocol as Program<SolcityProtocol>;

  // Test accounts
  const authority = provider.wallet as anchor.Wallet;
  const merchantKeypair = Keypair.generate();
  const customerKeypair = Keypair.generate();

  let loyaltyProgramPda: PublicKey;
  let loyaltyProgramBump: number;
  let mintPda: PublicKey;
  let mintBump: number;
  let merchantPda: PublicKey;
  let merchantBump: number;
  let customerPda: PublicKey;
  let customerBump: number;
  let customerTokenAccount: PublicKey;

  const programName = "Test Loyalty Program";
  const merchantName = "Test Coffee Shop";
  const rewardRate = 10; // 10 tokens per $1

  before(async () => {
    // Airdrop SOL to test accounts
    const airdropMerchant = await provider.connection.requestAirdrop(
      merchantKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropMerchant);

    const airdropCustomer = await provider.connection.requestAirdrop(
      customerKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropCustomer);
  });

  it("Initializes loyalty program", async () => {
    [loyaltyProgramPda, loyaltyProgramBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("loyalty_program"), authority.publicKey.toBuffer()],
      program.programId
    );

    [mintPda, mintBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), loyaltyProgramPda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeProgram(programName, 500) // 5% APY
      .accounts({
        authority: authority.publicKey,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Initialize program tx:", tx);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(
      loyaltyProgramPda
    );

    assert.equal(loyaltyProgram.name, programName);
    assert.equal(loyaltyProgram.interestRate, 500);
    assert.equal(loyaltyProgram.totalMerchants.toNumber(), 0);
    assert.equal(loyaltyProgram.totalCustomers.toNumber(), 0);
    assert.ok(loyaltyProgram.mint.equals(mintPda));
  });

  it("Registers a merchant", async () => {
    [merchantPda, merchantBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("merchant"),
        merchantKeypair.publicKey.toBuffer(),
        loyaltyProgramPda.toBuffer(),
      ],
      program.programId
    );

    const tx = await program.methods
      .registerMerchant(merchantName, new anchor.BN(rewardRate))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
        loyaltyProgram: loyaltyProgramPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Register merchant tx:", tx);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.name, merchantName);
    assert.equal(merchant.rewardRate.toNumber(), rewardRate);
    assert.equal(merchant.isActive, true);
    assert.equal(merchant.totalIssued.toNumber(), 0);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(
      loyaltyProgramPda
    );
    assert.equal(loyaltyProgram.totalMerchants.toNumber(), 1);
  });

  it("Registers a customer", async () => {
    [customerPda, customerBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("customer"),
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

    const tx = await program.methods
      .registerCustomer()
      .accounts({
        customerAuthority: customerKeypair.publicKey,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([customerKeypair])
      .rpc();

    console.log("Register customer tx:", tx);

    const customer = await program.account.customer.fetch(customerPda);
    assert.ok(customer.wallet.equals(customerKeypair.publicKey));
    assert.equal(customer.totalEarned.toNumber(), 0);
    assert.deepEqual(customer.tier, { bronze: {} });

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(
      loyaltyProgramPda
    );
    assert.equal(loyaltyProgram.totalCustomers.toNumber(), 1);
  });

  it("Issues rewards to customer", async () => {
    const purchaseAmount = 1000; // $10.00 in cents

    const tx = await program.methods
      .issueRewards(new anchor.BN(purchaseAmount))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Issue rewards tx:", tx);

    const customer = await program.account.customer.fetch(customerPda);
    const expectedReward = (purchaseAmount * rewardRate) / 100; // 100 tokens
    assert.equal(customer.totalEarned.toNumber(), expectedReward);
    assert.equal(customer.transactionCount.toNumber(), 1);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.totalIssued.toNumber(), expectedReward);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(
      loyaltyProgramPda
    );
    assert.equal(loyaltyProgram.totalTokensIssued.toNumber(), expectedReward);
  });

  it("Issues more rewards and upgrades tier to Silver", async () => {
    const purchaseAmount = 10000; // $100.00 in cents

    const tx = await program.methods
      .issueRewards(new anchor.BN(purchaseAmount))
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
        customer: customerPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Issue more rewards tx:", tx);

    const customer = await program.account.customer.fetch(customerPda);

    // Should have upgraded to Silver (1000+ tokens)
    assert.deepEqual(customer.tier, { silver: {} });
    assert.ok(customer.totalEarned.toNumber() >= 1000);
  });

  it("Redeems rewards", async () => {
    const redeemAmount = 50;

    const customerBefore = await program.account.customer.fetch(customerPda);
    const earnedBefore = customerBefore.totalEarned.toNumber();

    const tx = await program.methods
      .redeemRewards(
        new anchor.BN(redeemAmount),
        { discount: { percentage: 10 } }
      )
      .accounts({
        customerAuthority: customerKeypair.publicKey,
        customer: customerPda,
        merchant: merchantPda,
        loyaltyProgram: loyaltyProgramPda,
        mint: mintPda,
        customerTokenAccount: customerTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([customerKeypair])
      .rpc();

    console.log("Redeem rewards tx:", tx);

    const customer = await program.account.customer.fetch(customerPda);
    assert.equal(customer.totalRedeemed.toNumber(), redeemAmount);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.totalRedeemed.toNumber(), redeemAmount);

    const loyaltyProgram = await program.account.loyaltyProgram.fetch(
      loyaltyProgramPda
    );
    assert.equal(loyaltyProgram.totalTokensRedeemed.toNumber(), redeemAmount);
  });

  it("Creates a reward rule", async () => {
    const ruleId = 1;
    const [rewardRulePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reward_rule"),
        merchantPda.toBuffer(),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(ruleId)]).buffer)),
      ],
      program.programId
    );

    const tx = await program.methods
      .setRewardRule(
        new anchor.BN(ruleId),
        { bonusMultiplier: {} },
        new anchor.BN(200), // 2x multiplier
        new anchor.BN(500), // Min $5 purchase
        new anchor.BN(0), // Start immediately
        new anchor.BN(0) // No end time
      )
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
        rewardRule: rewardRulePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Set reward rule tx:", tx);

    const rewardRule = await program.account.rewardRule.fetch(rewardRulePda);
    assert.ok(rewardRule.merchant.equals(merchantPda));
    assert.equal(rewardRule.multiplier.toNumber(), 200);
    assert.equal(rewardRule.isActive, true);
  });

  it("Updates merchant settings", async () => {
    const newRewardRate = 15;

    const tx = await program.methods
      .updateMerchant(new anchor.BN(newRewardRate), null)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Update merchant tx:", tx);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.rewardRate.toNumber(), newRewardRate);
  });

  it("Deactivates merchant", async () => {
    const tx = await program.methods
      .updateMerchant(null, false)
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
        merchant: merchantPda,
      })
      .signers([merchantKeypair])
      .rpc();

    console.log("Deactivate merchant tx:", tx);

    const merchant = await program.account.merchant.fetch(merchantPda);
    assert.equal(merchant.isActive, false);
  });

  it("Fails to issue rewards when merchant is inactive", async () => {
    try {
      await program.methods
        .issueRewards(new anchor.BN(1000))
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
          merchant: merchantPda,
          customer: customerPda,
          loyaltyProgram: loyaltyProgramPda,
          mint: mintPda,
          customerTokenAccount: customerTokenAccount,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .signers([merchantKeypair])
        .rpc();

      assert.fail("Should have failed with inactive merchant");
    } catch (error) {
      assert.include(error.toString(), "MerchantNotActive");
    }
  });
});
