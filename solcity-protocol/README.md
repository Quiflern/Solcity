# Solcity Protocol

A decentralized customer loyalty program built on Solana using Token-2022 extensions.

## Features

- **Interest-Bearing Tokens**: Loyalty tokens that grow over time using Token-2022's Interest-Bearing extension
- **Tier System**: Bronze → Silver → Gold → Platinum with increasing reward multipliers
- **Flexible Reward Rules**: Merchants can create bonus multipliers, time-limited promotions, and more
- **On-Chain Transparency**: All rewards, redemptions, and rules are verifiable on-chain
- **Near-Zero Fees**: Powered by Solana's low transaction costs

## Program Structure

### State Accounts

- **LoyaltyProgram**: Main program account containing mint and global stats
- **Merchant**: Business account with reward rates and issuance tracking
- **Customer**: User account with tier, earnings, and redemption history
- **RewardRule**: Configurable bonus rules for merchants

### Instructions

1. `initialize_program` - Create a new loyalty program with Token-2022 mint
2. `register_merchant` - Register a business in the program
3. `register_customer` - Register a customer and create token account
4. `issue_rewards` - Mint tokens to customer based on purchase (with tier multipliers)
5. `redeem_rewards` - Burn tokens for benefits
6. `set_reward_rule` - Create bonus multiplier rules
7. `update_merchant` - Update merchant settings

## Tier System

| Tier | Threshold | Multiplier |
|------|-----------|------------|
| Bronze | 0 - 999 tokens | 1.0x |
| Silver | 1,000 - 9,999 tokens | 1.25x |
| Gold | 10,000 - 49,999 tokens | 1.5x |
| Platinum | 50,000+ tokens | 2.0x |

## Building

```bash
anchor build
```

## Testing

```bash
anchor test
```

## Deploying

```bash
# Devnet
anchor deploy --provider.cluster devnet

# Mainnet
anchor deploy --provider.cluster mainnet
```

## Token-2022 Extensions Used

1. **Interest-Bearing**: Tokens accrue value over time (5% APY default)
2. **Metadata**: Store program name and token info on-chain
3. **Memo Transfer**: Track purchase context with each transaction

## PDA Seeds

```rust
// Loyalty Program
["loyalty_program", authority: Pubkey]

// Mint
["mint", loyalty_program: Pubkey]

// Merchant
["merchant", authority: Pubkey, loyalty_program: Pubkey]

// Customer
["customer", wallet: Pubkey, loyalty_program: Pubkey]

// Reward Rule
["reward_rule", merchant: Pubkey, rule_id: u64]
```

## Example Usage

See `tests/solcity-protocol.ts` for complete examples.

### Initialize Program

```typescript
await program.methods
  .initializeProgram("My Loyalty Program", 500) // 5% APY
  .accounts({
    authority: wallet.publicKey,
    loyaltyProgram: loyaltyProgramPda,
    mint: mintPda,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .rpc();
```

### Issue Rewards

```typescript
await program.methods
  .issueRewards(new BN(1000)) // $10.00 purchase
  .accounts({
    merchantAuthority: merchant.publicKey,
    merchant: merchantPda,
    customer: customerPda,
    loyaltyProgram: loyaltyProgramPda,
    mint: mintPda,
    customerTokenAccount: customerAta,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
  })
  .signers([merchant])
  .rpc();
```

## License

MIT
