"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getCustomerPDA } from "@/lib/anchor/pdas";

export function useCustomerAccount() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customer", publicKey?.toString()],
    queryFn: async () => {
      if (!program || !publicKey) {
        return { customerAccount: null, isRegistered: false };
      }

      try {
        // For now, we'll use a default loyalty program
        // In production, you'd need to know which loyalty program to check
        // This is a simplified version - you may need to adjust based on your app logic
        const accounts = await program.account.customer.all([
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        if (accounts.length > 0) {
          return { customerAccount: accounts[0].account, isRegistered: true };
        }
        return { customerAccount: null, isRegistered: false };
      } catch (err: any) {
        console.error("Error fetching customer account:", err);
        return { customerAccount: null, isRegistered: false };
      }
    },
    enabled: !!program && !!publicKey,
  });

  return {
    customerAccount: data?.customerAccount || null,
    isRegistered: data?.isRegistered || false,
    isLoading,
    error,
    refetch,
  };
}
