"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

export default function WalletQueryInvalidator() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
  }, [publicKey, queryClient]);

  return null;
}
