import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { useMerchantAccount } from "./useMerchantAccount";

/**
 * Custom hook to close a merchant account and reclaim rent.
 *
 * This hook provides functionality to close a merchant account on the blockchain,
 * which returns the rent-exempt SOL to the merchant's wallet. This is typically
 * used when a merchant wants to permanently leave the loyalty program.
 *
 * @returns {Object} Close merchant functionality and state
 * @returns {Function} closeMerchant - Async function to close the merchant account
 * @returns {boolean} isClosing - Whether the close operation is in progress
 *
 * @example
 * ```tsx
 * const { closeMerchant, isClosing } = useMerchantClose();
 *
 * const handleClose = async () => {
 *   try {
 *     const result = await closeMerchant();
 *     console.log('Account closed:', result.signature);
 *   } catch (error) {
 *     console.error('Failed to close account:', error);
 *   }
 * };
 *
 * return (
 *   <button onClick={handleClose} disabled={isClosing}>
 *     {isClosing ? 'Closing...' : 'Close Merchant Account'}
 *   </button>
 * );
 * ```
 */
export function useMerchantClose() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const { merchantAccount } = useMerchantAccount();
  const [isClosing, setIsClosing] = useState(false);

  const closeMerchant = async () => {
    if (!program || !publicKey || !merchantAccount) {
      throw new Error("Missing required data");
    }

    setIsClosing(true);
    try {
      // Derive PDAs for the close operation
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

      // Execute close merchant transaction
      const tx = await program.methods
        .closeMerchant()
        .accounts({
          merchantAuthority: publicKey,
          merchant: merchant,
          loyaltyProgram: loyaltyProgram,
        } as any)
        .rpc();

      // Wait for transaction confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } finally {
      setIsClosing(false);
    }
  };

  return {
    closeMerchant,
    isClosing,
  };
}
