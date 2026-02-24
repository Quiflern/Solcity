"use client";

import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  getLoyaltyProgramPDA,
  getMerchantPDA,
  getRedemptionOfferPDA,
} from "@/lib/anchor/pdas";
import { useSolcityProgram } from "../program/useSolcityProgram";

/**
 * Redemption type variants for different offer types.
 */
export type RedemptionType =
  | { discount: { percentage: number } }
  | { freeProduct: { productId: string } }
  | { cashback: { amountLamports: BN } }
  | { exclusiveAccess: { accessType: string } }
  | { custom: { typeName: string } };

/**
 * Parameters for creating a new redemption offer.
 */
export interface RedemptionOfferParams {
  /** Name of the redemption offer */
  name: string;
  /** Description of what the offer provides */
  description: string;
  /** Icon identifier for the offer */
  icon: string;
  /** Cost in loyalty tokens to redeem this offer */
  cost: number;
  /** Type of redemption (discount, free product, etc.) */
  offerType: RedemptionType;
  /** Optional limit on how many times this can be redeemed */
  quantityLimit?: number;
  /** Optional expiration timestamp (Unix timestamp) */
  expiration?: number;
}

/**
 * Parameters for updating an existing redemption offer.
 */
export interface UpdateRedemptionOfferParams {
  /** Name of the offer to update (used to find the PDA) */
  name: string;
  /** New description (optional) */
  description?: string;
  /** New icon (optional) */
  icon?: string;
  /** New cost (optional) */
  cost?: number;
  /** New offer type (optional) */
  offerType?: RedemptionType;
  /** New quantity limit (optional, null to remove limit) */
  quantityLimit?: number | null;
  /** New expiration (optional, null to remove expiration) */
  expiration?: number | null;
}

/**
 * Custom hook for managing redemption offers.
 *
 * This hook provides functions to create, update, toggle, and delete
 * redemption offers for a merchant. Redemption offers are rewards that
 * customers can redeem using their loyalty points.
 *
 * All operations require a connected wallet and automatically handle
 * transaction confirmation.
 *
 * @returns {Object} Redemption offer management functions and state
 * @returns {Function} createRedemptionOffer - Create a new redemption offer
 * @returns {Function} updateRedemptionOffer - Update an existing offer
 * @returns {Function} toggleRedemptionOffer - Enable/disable an offer
 * @returns {Function} deleteRedemptionOffer - Delete an offer permanently
 * @returns {boolean} isLoading - Whether an operation is in progress
 * @returns {string|null} error - Error message if operation failed
 *
 * @example
 * ```tsx
 * const { createRedemptionOffer, isLoading, error } = useRedemptionOffers();
 *
 * const handleCreate = async () => {
 *   try {
 *     await createRedemptionOffer({
 *       name: "10% Off",
 *       description: "Get 10% off your next purchase",
 *       icon: "discount",
 *       cost: 100,
 *       offerType: { discount: { percentage: 10 } }
 *     });
 *   } catch (err) {
 *     console.error('Failed to create offer:', err);
 *   }
 * };
 * ```
 */
export function useRedemptionOffers() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolcityProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Creates a new redemption offer for the merchant.
   *
   * @param params - Redemption offer parameters
   * @returns Transaction signature and redemption offer PDA
   * @throws Error if wallet is not connected or transaction fails
   */
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
      const quantityLimitBN = params.quantityLimit
        ? new BN(params.quantityLimit)
        : null;
      const expirationBN = params.expiration ? new BN(params.expiration) : null;

      const tx = await program.methods
        .createRedemptionOffer(
          params.name,
          params.description,
          params.icon,
          costBN,
          params.offerType,
          quantityLimitBN,
          expirationBN,
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

  /**
   * Updates an existing redemption offer.
   *
   * Only the fields provided in params will be updated. Other fields
   * remain unchanged.
   *
   * @param params - Update parameters (name is required to identify the offer)
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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
        quantityLimitBN = params.quantityLimit
          ? new BN(params.quantityLimit)
          : null;
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
          expirationBN,
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

  /**
   * Toggles the active status of a redemption offer.
   *
   * If the offer is currently active, it will be deactivated and vice versa.
   * Deactivated offers cannot be redeemed by customers.
   *
   * @param name - Name of the offer to toggle
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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

  /**
   * Permanently deletes a redemption offer.
   *
   * This action cannot be undone. The offer account will be closed and
   * rent will be returned to the merchant.
   *
   * @param name - Name of the offer to delete
   * @returns Transaction signature
   * @throws Error if wallet is not connected or transaction fails
   */
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
