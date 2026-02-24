"use client";

import { useQuery } from "@tanstack/react-query";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Custom hook to fetch all redemption offers from all merchants.
 *
 * This hook retrieves all redemption offer accounts from the blockchain,
 * regardless of which merchant created them. Useful for displaying a
 * marketplace or catalog of all available redemption offers.
 *
 * @returns {UseQueryResult} React Query result containing all redemption offers
 *
 * @example
 * ```tsx
 * const { data: offers, isLoading } = useAllRedemptionOffers();
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
export function useAllRedemptionOffers() {
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
