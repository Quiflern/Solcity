# SolCity Protocol Tests

Comprehensive E2E test suite for the SolCity loyalty protocol.

## Test Structure

```
tests/
├── helpers/
│   ├── setup.ts          # Test setup utilities and context
│   └── assertions.ts     # Custom assertion helpers
├── 01-initialize-program.test.ts
├── 02-register-merchant.test.ts
├── 03-register-customer.test.ts
├── 04-issue-rewards.test.ts
├── 05-redeem-rewards.test.ts
├── 06-reward-rules.test.ts
├── 07-update-merchant.test.ts
└── solcity-protocol.ts   # Legacy comprehensive test (kept for reference)
```

## Running Tests

### Run all tests
```bash
anchor test
```

### Run specific test file
```bash
anchor test --skip-build -- --grep "Initialize Program"
```

### Run tests with local validator
```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Run tests
anchor test --skip-local-validator
```

## Test Coverage

### 01-initialize-program.test.ts
- ✅ Successfully initializes a loyalty program
- ✅ Validates program name (empty, too long)
- ✅ Validates interest rate bounds
- ✅ Creates Token-2022 mint with correct authority

### 02-register-merchant.test.ts
- ✅ Successfully registers a merchant
- ✅ Validates merchant name (empty, too long)
- ✅ Validates reward rate (zero, positive)
- ✅ Allows multiple merchants to register
- ✅ Increments total merchant count

### 03-register-customer.test.ts
- ✅ Successfully registers a customer
- ✅ Creates associated token account
- ✅ Initializes customer with Bronze tier
- ✅ Allows multiple customers to register
- ✅ Increments total customer count

### 04-issue-rewards.test.ts
- ✅ Successfully issues rewards for purchases
- ✅ Calculates rewards based on merchant rate
- ✅ Applies tier multipliers correctly
- ✅ Upgrades customer tier when thresholds reached
- ✅ Updates transaction counts
- ✅ Fails when merchant is inactive
- ✅ Validates token account ownership

### 05-redeem-rewards.test.ts
- ✅ Successfully redeems rewards
- ✅ Burns tokens from customer account
- ✅ Updates redemption counters
- ✅ Validates sufficient balance
- ✅ Prevents zero amount redemptions
- ✅ Supports multiple redemption types
- ✅ Emits redemption events

### 06-reward-rules.test.ts
- ✅ Successfully creates reward rules
- ✅ Validates multiplier bounds (>= 100)
- ✅ Validates time ranges
- ✅ Supports multiple rule types
- ✅ Associates rules with merchants

### 07-update-merchant.test.ts
- ✅ Successfully updates reward rate
- ✅ Activates/deactivates merchant
- ✅ Updates multiple fields simultaneously
- ✅ Validates reward rate (non-zero)
- ✅ Prevents unauthorized updates

## Security Tests

Each test file includes security validations:
- Token account ownership verification
- Mint validation
- Authority checks
- PDA seed validation
- Constraint enforcement

## Helper Functions

### setup.ts
- `setupTest()` - Initialize test context
- `airdrop()` - Fund test accounts
- `findProgramAddress()` - Calculate PDAs
- `SEEDS` - Constant seed values

### assertions.ts
- `assertPublicKeyEqual()` - Compare public keys
- `assertBNEqual()` - Compare BN values
- `assertBNGreaterThan()` - Compare BN values
- `assertError()` - Expect specific errors
- `assertTierEqual()` - Compare customer tiers

## Notes

- Tests run sequentially to maintain state consistency
- Each test file has its own `before()` setup
- Tests use local validator for isolation
- All PDAs are derived deterministically
- Token accounts use Token-2022 program
