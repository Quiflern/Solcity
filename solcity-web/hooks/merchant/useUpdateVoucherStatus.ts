"use client";

import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Voucher status options
 */
export type VoucherStatus = "Active" | "Used" | "Revoked";

/**
 * Parameters for updating voucher status
 */
interface UpdateVoucherStatusParams {
  /** Public key of the voucher to update */
  voucherPubkey: PublicKey;
  /** Public key of the merchant */
  merchantPubkey: PublicKey;
  /** New status to set */
  status: VoucherStatus;
}

/**
 * Custom hook to update voucher status.
 * 
 * Allows merchants to:
 * - Mark vouchers as Used (when customer redeems in-store)
 * - Revoke vouchers (cancel/fraud)
 * - Reactivate vouchers (undo accidental revoke)
 *
 * @returns React Query mutation for updating voucher status
 */
export function useUpdateVoucherStatus() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucherPubkey,
      merchantPubkey,
      status,
    }: UpdateVoucherStatusParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      // Fetch all offer redemption records and find the one matching this voucher
      const records = await program.account.offerRedemptionRecord.all([
        {
          memcmp: {
            offset: 8 + 32 + 32 + 32, // Skip discriminator + offer + merchant + customer
            bytes: voucherPubkey.toBase58(),
          },
        },
      ]);

      if (records.length === 0) {
        throw new Error("Offer redemption record not found");
      }

      const offerRedemptionRecordPda = records[0].publicKey;

      // Convert status to enum format expected by program
      const statusEnum = { [status.toLowerCase()]: {} };

      // Execute the update voucher status transaction
      const tx = await program.methods
        .useVoucher(statusEnum)
        .accountsPartial({
          merchantAuthority: wallet.publicKey,
          merchant: merchantPubkey,
          voucher: voucherPubkey,
          offerRedemptionRecord: offerRedemptionRecordPda,
        })
        .rpc();

      return { signature: tx, status };
    },
    onSuccess: (data) => {
      const statusMessages = {
        Used: "Voucher marked as used",
        Revoked: "Voucher revoked successfully",
        Active: "Voucher reactivated",
      };

      toast.success(statusMessages[data.status], {
        duration: 3000,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["merchantVouchers"] });
      queryClient.invalidateQueries({ queryKey: ["customerVouchers"] });
    },
    onError: (error: Error) => {
      console.error("Update voucher status error:", error);
      // Error handling is done in the component
    },
  });
}
