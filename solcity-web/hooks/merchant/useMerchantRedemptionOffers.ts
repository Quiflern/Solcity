"use client";

import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to fetch all redemption offers for a merchant.
 *
 * This hook queries the blockchain for all redemption offer accounts
 * created by the specified merchant. Redemption offers are rewards that
 * customers can redeem using their loyalty points.
 *
 * @param merchantPubkey - Public key of the merchant account
 * @returns {UseQueryResult} React Query result containing redemption offers
 *
 * @example
 * ```tsx
 * const { data: offers, isLoading } = useMerchantRedemptionOffers(merchantPubkey);
 *
 * if (isLoading) return <div>Loading offers...</div>;
 *
 * return (
 *   <div>
 *     {offers?.map(offer => (
 *       <OfferCard key={offer.publicKey.toString()} offer={offer} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useMerchantRedemptionOffers(merchantPubkey: PublicKey | null) {
  const { program } = useSolcityProgram();

  return useQuery({
    queryKey: ["merchantRedemptionOffers", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!program || !merchantPubkey) {
        return [];
      }

      try {
        // Fetch all redemption offer accounts for this merchant
        // Uses memcmp to filter by merchant field (offset 8 after discriminator)
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
        return [];
      }
    },
    enabled: !!program && !!merchantPubkey,
    staleTime: 30000, // 30 seconds
  });
}
