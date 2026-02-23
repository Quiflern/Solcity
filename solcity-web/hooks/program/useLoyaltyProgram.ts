"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA } from "@/lib/anchor/pdas";

export function useLoyaltyProgram() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error } = useQuery({
    queryKey: ["loyaltyProgram", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return null;
      }

      try {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const account = await program.account.loyaltyProgram.fetchNullable(loyaltyProgram);
        return account;
      } catch (err) {
        console.error("Error fetching loyalty program:", err);
        return null;
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    loyaltyProgram: data,
    isLoading,
    error,
  };
}
