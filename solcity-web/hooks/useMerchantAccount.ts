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
        setIsRegistered(false);
        setMerchantAccount(null);
        return;
      }

      setIsLoading(true);

      try {
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        const account = await program.account.merchant.fetchNullable(merchant);

        if (account) {
          setMerchantAccount(account);
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
          setMerchantAccount(null);
        }
      } catch (err: any) {
        // Check if account exists but has wrong structure
        const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
        const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);

        try {
          const accountInfo = await connection.getAccountInfo(merchant);
          if (accountInfo && accountInfo.owner.toString() === program.programId.toString()) {
            // Account exists but can't be deserialized - needs migration
            setIsRegistered(true);
            setMerchantAccount({ needsMigration: true });
          } else {
            setIsRegistered(false);
            setMerchantAccount(null);
          }
        } catch {
          setIsRegistered(false);
          setMerchantAccount(null);
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
