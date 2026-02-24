import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { useMerchantAccount } from "./useMerchantAccount";

/**
 * Custom hook to update merchant account information.
 *
 * This hook provides functionality to update various merchant settings including
 * business description, avatar URL, category, reward rate, and active status.
 * Only the merchant authority (wallet owner) can update their account.
 *
 * @returns {Object} Update merchant functionality and state
 * @returns {Function} updateMerchant - Async function to update merchant account
 * @returns {boolean} isUpdating - Whether an update operation is in progress
 *
 * @example
 * ```tsx
 * const { updateMerchant, isUpdating } = useMerchantUpdate();
 *
 * const handleUpdate = async () => {
 *   try {
 *     const result = await updateMerchant({
 *       description: 'Updated description',
 *       rewardRate: 150,
 *       isActive: true
 *     });
 *     console.log('Updated:', result.signature);
 *   } catch (error) {
 *     console.error('Update failed:', error);
 *   }
 * };
 *
 * return (
 *   <button onClick={handleUpdate} disabled={isUpdating}>
 *     {isUpdating ? 'Updating...' : 'Update Profile'}
 *   </button>
 * );
 * ```
 */
export function useMerchantUpdate() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const { merchantAccount } = useMerchantAccount();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Updates merchant account with the provided fields.
   * Only provided fields will be updated; omitted fields remain unchanged.
   *
   * @param updates - Object containing fields to update
   * @param updates.description - New business description
   * @param updates.avatarUrl - New avatar/logo URL
   * @param updates.category - New business category
   * @param updates.rewardRate - New reward rate (tokens per dollar)
   * @param updates.isActive - New active status
   * @returns Transaction signature
   */
  const updateMerchant = async (updates: {
    description?: string;
    avatarUrl?: string;
    category?: string;
    rewardRate?: number;
    isActive?: boolean;
  }) => {
    if (!program || !publicKey || !merchantAccount) {
      throw new Error("Missing required data");
    }

    setIsUpdating(true);
    try {
      // Derive PDAs for the update operation
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

      // Convert rewardRate to BN if provided
      const rewardRateBN =
        updates.rewardRate !== undefined ? new BN(updates.rewardRate) : null;

      // Execute update merchant transaction
      const tx = await program.methods
        .updateMerchant(
          rewardRateBN,
          updates.description !== undefined ? updates.description : null,
          updates.avatarUrl !== undefined ? updates.avatarUrl : null,
          updates.category !== undefined ? updates.category : null,
          updates.isActive !== undefined ? updates.isActive : null,
        )
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
      setIsUpdating(false);
    }
  };

  return {
    updateMerchant,
    isUpdating,
  };
}
