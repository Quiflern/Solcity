"use client";

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import IDL_JSON from "@/lib/anchor/idl/solcity_protocol.json";
import type { SolcityProtocol } from "@/lib/anchor/types/solcity_protocol";
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
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["merchantRedemptionOffers", merchantPubkey?.toString()],
    queryFn: async () => {
      if (!merchantPubkey) {
        return [];
      }

      try {
        // Use existing program or create a read-only one
        let programToUse = program;

        if (!programToUse) {
          // Create a read-only wallet for public data access
          const readOnlyWallet = {
            publicKey: null,
            signTransaction: async () => {
              throw new Error("Read-only wallet cannot sign");
            },
            signAllTransactions: async () => {
              throw new Error("Read-only wallet cannot sign");
            },
          } as unknown as Wallet;

          const provider = new AnchorProvider(
            connection,
            readOnlyWallet,
            { commitment: "confirmed" },
          );

          programToUse = new Program<SolcityProtocol>(
            IDL_JSON as SolcityProtocol,
            provider,
          );
        }

        // Fetch all redemption offer accounts for this merchant
        // Uses memcmp to filter by merchant field (offset 8 after discriminator)
        const offers = await programToUse.account.redemptionOffer.all([
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
    enabled: !!merchantPubkey,
    staleTime: 30000, // 30 seconds
  });
}
