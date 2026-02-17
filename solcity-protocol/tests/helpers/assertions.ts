import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const { BN } = anchor;

export function assertPublicKeyEqual(
  actual: PublicKey,
  expected: PublicKey,
  message?: string
): void {
  assert.ok(
    actual.equals(expected),
    message || `Expected ${actual.toString()} to equal ${expected.toString()}`
  );
}

export function assertBNEqual(
  actual: BN | number,
  expected: BN | number,
  message?: string
): void {
  const actualBN = typeof actual === "number" ? new BN(actual) : actual;
  const expectedBN = typeof expected === "number" ? new BN(expected) : expected;

  assert.ok(
    actualBN.eq(expectedBN),
    message || `Expected ${actualBN.toString()} to equal ${expectedBN.toString()}`
  );
}

export function assertBNGreaterThan(
  actual: BN | number,
  expected: BN | number,
  message?: string
): void {
  const actualBN = typeof actual === "number" ? new BN(actual) : actual;
  const expectedBN = typeof expected === "number" ? new BN(expected) : expected;

  assert.ok(
    actualBN.gt(expectedBN),
    message || `Expected ${actualBN.toString()} to be greater than ${expectedBN.toString()}`
  );
}

export async function assertError(
  fn: () => Promise<any>,
  errorMessage: string
): Promise<void> {
  try {
    await fn();
    assert.fail(`Expected error containing "${errorMessage}" but transaction succeeded`);
  } catch (error) {
    assert.include(
      error.toString(),
      errorMessage,
      `Expected error to contain "${errorMessage}"`
    );
  }
}

export function assertTierEqual(
  actual: any,
  expected: "bronze" | "silver" | "gold" | "platinum"
): void {
  assert.deepEqual(actual, { [expected]: {} });
}
