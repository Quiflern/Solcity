"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { useSolcityProgram } from "./useSolcityProgram";

export function useAllRedemptionOffers() {
  const { connection } = useConnection();
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["allRedemptionOffers"],
    queryFn: async () => {
      if (!program) {
        return [];
      }

      try {
        // Fetch all redemption offer accounts
        const offers = await program.account.redemptionOffer.all();

        return offers.map((offer) => ({
          publicKey: offer.publicKey,
          ...offer.account,
        }));
      } catch (err) {
        console.error("Error fetching all redemption offers:", err);
        return [];
      }
    },
    enabled: !!program,
    staleTime: 30000, // 30 seconds
  });
}
