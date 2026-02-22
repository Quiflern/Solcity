"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { useSolcityProgram } from "./useSolcityProgram";
import { getLoyaltyProgramPDA, getMerchantPDA, getRedemptionOfferPDA } from "@/lib/anchor/pdas";

export type RedemptionType =
  | { discount: { percentage: number } }
  | { freeProduct: { productId: string } }
  | { cashback: { amountLamports: BN } }
  | { exclusiveAccess: { accessType: string } }
  | { custom: { typeName: string } };

export interface RedemptionOfferParams {
  name: string;
  description: string;
  icon: string;
  cost: number;
  offerType: RedemptionType;
  quantityLimit?: number;
  expiration?: number; // Unix timestamp
}

export interface UpdateRedemptionOfferParams {
  name: string; // Used to find the PDA
  description?: string;
  icon?: string;
  cost?: number;
  offerType?: RedemptionType;
  quantityLimit?: number | null;
  expiration?: number | null;
}

export function useRedemptionOffers() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRedemptionOffer = async (params: RedemptionOfferParams) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [redemptionOffer] = getRedemptionOfferPDA(merchant, params.name);

      const costBN = new BN(params.cost);
      const quantityLimitBN = params.quantityLimit ? new BN(params.quantityLimit) : null;
      const expirationBN = params.expiration ? new BN(params.expiration) : null;

      const tx = await program.methods
        .createRedemptionOffer(
          params.name,
          params.description,
          params.icon,
          costBN,
          params.offerType,
          quantityLimitBN,
          expirationBN
        )
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
          loyaltyProgram: loyaltyProgram,
          redemptionOffer: redemptionOffer,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx, redemptionOffer };
    } catch (err: any) {
      setError(err.message || "Failed to create redemption offer");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRedemptionOffer = async (params: UpdateRedemptionOfferParams) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [redemptionOffer] = getRedemptionOfferPDA(merchant, params.name);

      const costBN = params.cost ? new BN(params.cost) : null;

      // Handle quantity limit - convert undefined to null for Anchor
      let quantityLimitBN = null;
      if (params.quantityLimit !== undefined) {
        quantityLimitBN = params.quantityLimit ? new BN(params.quantityLimit) : null;
      }

      // Handle expiration - convert undefined to null for Anchor
      let expirationBN = null;
      if (params.expiration !== undefined) {
        expirationBN = params.expiration ? new BN(params.expiration) : null;
      }

      const tx = await program.methods
        .updateRedemptionOffer(
          params.description || null,
          params.icon || null,
          costBN,
          params.offerType || null,
          quantityLimitBN,
          expirationBN
        )
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
          redemptionOffer: redemptionOffer,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to update redemption offer");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRedemptionOffer = async (name: string) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [redemptionOffer] = getRedemptionOfferPDA(merchant, name);

      const tx = await program.methods
        .toggleRedemptionOffer()
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
          redemptionOffer: redemptionOffer,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to toggle redemption offer");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRedemptionOffer = async (name: string) => {
    if (!program || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loyaltyProgram] = getLoyaltyProgramPDA(publicKey);
      const [merchant] = getMerchantPDA(publicKey, loyaltyProgram);
      const [redemptionOffer] = getRedemptionOfferPDA(merchant, name);

      const tx = await program.methods
        .deleteRedemptionOffer()
        .accountsPartial({
          merchantAuthority: publicKey,
          merchant: merchant,
          redemptionOffer: redemptionOffer,
        })
        .rpc();

      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      return { signature: tx };
    } catch (err: any) {
      setError(err.message || "Failed to delete redemption offer");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRedemptionOffer,
    updateRedemptionOffer,
    toggleRedemptionOffer,
    deleteRedemptionOffer,
    isLoading,
    error,
  };
}
