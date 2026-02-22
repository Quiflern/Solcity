import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";
import { useMerchantAccount } from "./useMerchantAccount";
import { useState } from "react";

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
      const tx = await program.methods
        .closeMerchant()
        .accounts({
          merchantAuthority: publicKey,
        } as any)
        .rpc();

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
