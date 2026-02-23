"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSolcityProgram } from "../program/useSolcityProgram";

export function useMerchantRedemptionOffers(merchantPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["merchantRedemptionOffers", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all redemption offer accounts for this merchant
        const offers = await program.account.redemptionOffer.all([
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: merchantPubkey.toBase58(),
            },
          },
        ]);

        return offers.map((offer) => ({
          publicKey: offer.publicKey,
          ...offer.account,
        }));
      } catch (err) {
        console.error("Error fetching redemption offers:", err);
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    staleTime: 30000, // 30 seconds
  });
}
