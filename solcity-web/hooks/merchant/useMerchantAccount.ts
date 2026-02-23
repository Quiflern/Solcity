"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "../program/useSolcityProgram";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

export function useMerchantAccount() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["merchant", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return { merchantAccount: null, isRegistered: false };
      }

      try {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        const account = await program.account.merchant.fetchNullable(merchant);

        if (account) {
          // Check if account data is valid (not corrupted)
          if (account.createdAt === 0 || account.bump === 0) {
            // Corrupted account - treat as not registered
            console.log("Detected corrupted merchant account - allowing re-registration");
            return { merchantAccount: null, isRegistered: false };
          }
          return { merchantAccount: account, isRegistered: true };
        }
        return { merchantAccount: null, isRegistered: false };
      } catch (err: any) {
        // Check if account exists but has wrong structure
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        try {
          const accountInfo = await connection.getAccountInfo(merchant);
          if (accountInfo && accountInfo.owner.toString() === program.programId.toString()) {
            // Account exists but can't be deserialized - treat as corrupted, allow re-registration
            console.log("Account exists but corrupted - allowing re-registration");
            return { merchantAccount: null, isRegistered: false };
          }
        } catch {
          // Ignore
        }
        return { merchantAccount: null, isRegistered: false };
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    merchantAccount: data?.merchantAccount || null,
    isRegistered: data?.isRegistered || false,
    isLoading,
    error,
    refetch,
  };
}
