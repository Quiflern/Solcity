"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

export function useMerchantAccount() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [merchantAccount, setMerchantAccount] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMerchant = async () => {
      if (!program || !publicKey) {
        setIsLoading(false);
        return;
      }

      try {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        // @ts-ignore - Using JSON IDL
        const account = await program.account.merchant.fetchNullable(merchant);

        if (account) {
          setMerchantAccount(account);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (err: any) {
        // If buffer length error, it means old account structure - needs migration
        if (err.message?.includes("buffer length")) {
          setIsRegistered(true); // Account exists but needs migration
          setMerchantAccount({ needsMigration: true });
        } else {
          setIsRegistered(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkMerchant();
  }, [program, publicKey, connection]);

  return {
    merchantAccount,
    isRegistered,
    isLoading,
  };
}
