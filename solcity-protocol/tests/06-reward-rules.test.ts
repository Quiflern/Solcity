import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { setupTest, findProgramAddress, SEEDS, airdrop } from "./helpers/setup";
import { assertBNEqual, assertPublicKeyEqual, assertError } from "./helpers/assertions";
import { assert } from "chai";

describe("Reward Rules", () => {
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
        new anchor.BN(200), // 2x multiplier
        new anchor.BN(500), // Min $5 purchase
        new anchor.BN(0), // Start immediately
        new anchor.BN(0) // No end time
      )
      .accounts({
        merchantAuthority: merchantKeypair.publicKey,
      })
      .signers([merchantKeypair])
      .rpc();

    const rewardRule = await program.account.rewardRule.fetch(rewardRulePda);
    assertPublicKeyEqual(rewardRule.merchant, merchantPda);
    assertBNEqual(rewardRule.multiplier, 200);
    assertBNEqual(rewardRule.minPurchase, 500);
    assert.equal(rewardRule.isActive, true);
  });

  it("Fails to create rule with multiplier less than 100", async () => {
    const { program } = await ctx;
    const ruleId = 2;

    await assertError(
      () =>
        program.methods
          .setRewardRule(
            new anchor.BN(ruleId),
            { bonusMultiplier: {} },
            new anchor.BN(50), // Invalid: less than 100
            new anchor.BN(500),
            new anchor.BN(0),
            new anchor.BN(0)
          )
          .accounts({
            merchantAuthority: merchantKeypair.publicKey,
          })
          .signers([merchantKeypair])
          .rpc(),
      "InvalidRewardAmount"
    );
  });

  it("Fails to create rule with invalid time range", async () => {
    const { program } = await ctx;
    const ruleId = 3;

    const now = Math.floor(Date.now() / 1000);

    await assertError(
      () =>
        program.methods
          .setRewardRule(
            new anchor.BN(ruleId),
            { bonusMultiplier: {} },
            new anchor.BN(200),
            new anchor.BN(500),
            new anchor.BN(now + 1000), // Start time
            new anchor.BN(now) // End time before start
          )
          .accounts({
            merchantAuthority: merchantKeypair.publicKey,
          })
          .signers([merchantKeypair])
          .rpc(),
      "InvalidTimeRange"
    );
  });

  it("Creates multiple rule types", async () => {
    const { program } = await ctx;

    const ruleTypes = [
      { baseReward: {} },
      { firstPurchaseBonus: {} },
      { referralBonus: {} },
      { tierBonus: {} },
      { streakBonus: {} },
    ];

    for (let i = 0; i < ruleTypes.length; i++) {
      const ruleId = 10 + i;
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
          ruleTypes[i],
          new anchor.BN(150),
          new anchor.BN(0),
          new anchor.BN(0),
          new anchor.BN(0)
        )
        .accounts({
          merchantAuthority: merchantKeypair.publicKey,
        })
        .signers([merchantKeypair])
        .rpc();

      const rewardRule = await program.account.rewardRule.fetch(rewardRulePda);
      assert.equal(rewardRule.isActive, true);
    }
  });
});
