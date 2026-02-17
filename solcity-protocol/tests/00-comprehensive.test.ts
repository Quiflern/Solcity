import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertPublicKeyEqual, assertBNEqual, assertError, assertTierEqual, assertBNGreaterThan } from "./helpers/assertions";

describe("Solcity Protocol - Comprehensive Tests", () => {
  const ctx = setupTest();
  let loyaltyProgramPda: PublicKey;
  let mintPda: PublicKey;
  let merchantKeypair: Keypair;
  let merchantPda: PublicKey;
  let customerKeypair: Keypair;
  let customerPda: PublicKey;
  let customerTokenAccount: PublicKey;

  const programName = "Test Loyalty Program";
  const interestRate = 500;
  const merchantName = "Test Merchant";
  const rewardRate = 10;

  describe("Initialize Program", () => {
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
      const { program, connection } = await ctx;
      const newAuthority = anchor.web3.Keypair.generate();
      await airdrop(connection, newAuthority.publicKey);

      await assertError(
        () =>
          program.methods
            .initializeProgram("", interestRate)
            .accounts({
              authority: newAuthority.publicKey,
            })
            .signers([newAuthority])
            .rpc(),
        "NameEmpty"
      );
    });

    it("Fails to initialize with name too long", async () => {
      const { program, connection } = await ctx;
      const longName = "A".repeat(33);
      const newAuthority = anchor.web3.Keypair.generate();
      await airdrop(connection, newAuthority.publicKey);

      await assertError(
        () =>
          program.methods
            .initializeProgram(longName, interestRate)
            .accounts({
              authority: newAuthority.publicKey,
            })
            .signers([newAuthority])
            .rpc(),
        "NameTooLong"
      );
    });

    it("Fails to initialize with invalid interest rate", async () => {
      const { program, connection } = await ctx;
      const invalidRate = 10001;
      const newAuthority = anchor.web3.Keypair.generate();
      await airdrop(connection, newAuthority.publicKey);

      await assertError(
        () =>
          program.methods
            .initializeProgram(programName, invalidRate)
            .accounts({
              authority: newAuthority.publicKey,
            })
            .signers([newAuthority])
            .rpc(),
        "InvalidInterestRate"
      );
    });
  });

  describe("Register Merchant", () => {
    before(async () => {
      const { connection } = await ctx;
      merchantKeypair = Keypair.generate();
      await airdrop(connection, merchantKeypair.publicKey);

      const { program } = await ctx;
      [merchantPda] = findProgramAddress(
        [SEEDS.MERCHANT, merchantKeypair.publicKey.toBuffer(), loyaltyProgramPda.toBuffer()],
        program.programId
      );
    });

    it("Successfully registers a merchant", async () => {
      const { program } = await ctx;

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

      const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
      assertBNEqual(loyaltyProgram.totalMerchants, 1);
    });

    it("Fails to register merchant with empty name", async () => {
      const { program, connection } = await ctx;
      const newMerchantKeypair = Keypair.generate();
      await airdrop(connection, newMerchantKeypair.publicKey);

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

    it("Fails to register merchant with zero reward rate", async () => {
      const { program, connection } = await ctx;
      const newMerchantKeypair = Keypair.generate();
      await airdrop(connection, newMerchantKeypair.publicKey);

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
  });

  describe("Register Customer", () => {
    before(async () => {
      const { connection, program } = await ctx;
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
    });

    it("Successfully registers a customer", async () => {
      const { program } = await ctx;

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
      assertBNEqual(customer.totalEarned, 0);
      assertBNEqual(customer.totalRedeemed, 0);
      assertTierEqual(customer.tier, "bronze");

      const loyaltyProgram = await program.account.loyaltyProgram.fetch(loyaltyProgramPda);
      assertBNEqual(loyaltyProgram.totalCustomers, 1);
    });
  });

  describe("Issue Rewards", () => {
    it("Successfully issues rewards for a purchase", async () => {
      const { program } = await ctx;
      const purchaseAmount = 1000;

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
      const expectedReward = (purchaseAmount * 10) / 100;
      assertBNEqual(customer.totalEarned, expectedReward);
      assertBNEqual(customer.transactionCount, 1);
    });

    it("Upgrades customer tier when threshold is reached", async () => {
      const { program } = await ctx;
      const purchaseAmount = 10000;

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
      assertTierEqual(customer.tier, "silver");
      assertBNGreaterThan(customer.totalEarned, 1000);
    });

    it("Fails when merchant is inactive", async () => {
      const { program } = await ctx;

      await program.methods
        .updateMerchant(null, false)
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
          merchant: merchantPda,
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

      // Reactivate for next tests
      await program.methods
        .updateMerchant(null, true)
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
          merchant: merchantPda,
        })
        .signers([merchantKeypair])
        .rpc();
    });
  });

  describe("Redeem Rewards", () => {
    it("Successfully redeems rewards", async () => {
      const { program } = await ctx;
      const redeemAmount = 50;

      await program.methods
        .redeemRewards(new anchor.BN(redeemAmount), { discount: { percentage: 10 } })
        .accounts({
          customerAuthority: customerKeypair.publicKey,
          merchant: merchantPda,
          loyaltyProgram: loyaltyProgramPda,
          mint: mintPda,
          customerTokenAccount: customerTokenAccount,
        })
        .signers([customerKeypair])
        .rpc();

      const customer = await program.account.customer.fetch(customerPda);
      assertBNEqual(customer.totalRedeemed, redeemAmount);
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
              mint: mintPda,
              customerTokenAccount: customerTokenAccount,
            })
            .signers([customerKeypair])
            .rpc(),
        "InsufficientBalance"
      );
    });
  });

  describe("Reward Rules", () => {
    it("Successfully creates a reward rule", async () => {
      const { program } = await ctx;
      const ruleId = 1;

      const [rewardRulePda] = findProgramAddress(
        [
          SEEDS.REWARD_RULE,
          merchantPda.toBuffer(),
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(ruleId)]).buffer)),
        ],
        program.programId
      );

      await program.methods
        .setRewardRule(
          new anchor.BN(ruleId),
          { bonusMultiplier: {} },
          new anchor.BN(200),
          new anchor.BN(500),
          new anchor.BN(0),
          new anchor.BN(0)
        )
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
          merchant: merchantPda,
          rewardRule: rewardRulePda,
        })
        .signers([merchantKeypair])
        .rpc();

      const rewardRule = await program.account.rewardRule.fetch(rewardRulePda);
      assertPublicKeyEqual(rewardRule.merchant, merchantPda);
      assertBNEqual(rewardRule.multiplier, 200);
      assert.equal(rewardRule.isActive, true);
    });

    it("Fails to create rule with multiplier less than 100", async () => {
      const { program } = await ctx;
      const ruleId = 2;

      const [rewardRulePda] = findProgramAddress(
        [
          SEEDS.REWARD_RULE,
          merchantPda.toBuffer(),
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(ruleId)]).buffer)),
        ],
        program.programId
      );

      await assertError(
        () =>
          program.methods
            .setRewardRule(
              new anchor.BN(ruleId),
              { bonusMultiplier: {} },
              new anchor.BN(50),
              new anchor.BN(500),
              new anchor.BN(0),
              new anchor.BN(0)
            )
            .accounts({
              merchantAuthority: merchantKeypair.publicKey,
              merchant: merchantPda,
              rewardRule: rewardRulePda,
            })
            .signers([merchantKeypair])
            .rpc(),
        "InvalidRewardAmount"
      );
    });
  });

  describe("Update Merchant", () => {
    it("Successfully updates reward rate", async () => {
      const { program } = await ctx;
      const newRewardRate = 15;

      await program.methods
        .updateMerchant(new anchor.BN(newRewardRate), null)
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
          merchant: merchantPda,
        })
        .signers([merchantKeypair])
        .rpc();

      const merchant = await program.account.merchant.fetch(merchantPda);
      assertBNEqual(merchant.rewardRate, newRewardRate);
    });

    it("Fails to update with zero reward rate", async () => {
      const { program } = await ctx;

      await assertError(
        () =>
          program.methods
            .updateMerchant(new anchor.BN(0), null)
            .accounts({
              merchantAuthority: merchantKeypair.publicKey,
              merchant: merchantPda,
            })
            .signers([merchantKeypair])
            .rpc(),
        "InvalidRewardAmount"
      );
    });
  });
});
