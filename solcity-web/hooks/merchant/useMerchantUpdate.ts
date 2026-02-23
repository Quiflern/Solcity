import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { useMerchantAccount } from "./useMerchantAccount";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";
import { BN } from "@coral-xyz/anchor";
import { useState } from "react";

export function useMerchantUpdate() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const { merchantAccount } = useMerchantAccount();
  const [isUpdating, setIsUpdating] = useState(false);

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
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

      // Convert rewardRate to BN if provided
      const rewardRateBN = updates.rewardRate !== undefined ? new BN(updates.rewardRate) : null;

      const tx = await program.methods
        .updateMerchant(
          rewardRateBN,
          updates.description !== undefined ? updates.description : null,
          updates.avatarUrl !== undefined ? updates.avatarUrl : null,
          updates.category !== undefined ? updates.category : null,
          updates.isActive !== undefined ? updates.isActive : null
        )
        .accounts({
          merchantAuthority: publicKey,
          merchant: merchant,
          loyaltyProgram: loyaltyProgram,
        } as any)
        .rpc();

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
