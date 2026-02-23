import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { getProgram } from "@/lib/anchor/setup";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { getCustomerPDA, getMintPDA } from "@/lib/anchor/pdas";

interface RedeemRewardsParams {
  merchantPubkey: PublicKey;
  offerPubkey: PublicKey;
  offerName: string;
}

export function useRedeemRewards() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ merchantPubkey, offerPubkey, offerName }: RedeemRewardsParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      // Fetch merchant account to get the actual loyalty program
      const merchantAccount = await program.account.merchant.fetch(merchantPubkey);
      const loyaltyProgram = merchantAccount.loyaltyProgram;

      // Get customer PDA
      const [customerPda] = getCustomerPDA(wallet.publicKey, loyaltyProgram);

      // Check if customer account exists
      const customerAccount = await connection.getAccountInfo(customerPda);
      if (!customerAccount) {
        throw new Error("You need to register as a customer first. Please visit a merchant and make a purchase to register.");
      }

      // Get mint PDA
      const [mintPda] = getMintPDA(loyaltyProgram);

      // Get customer token account
      const customerTokenAccount = getAssociatedTokenAddressSync(
        mintPda,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // Generate unique voucher seed (timestamp + random)
      const voucherSeedNumber = Date.now() + Math.floor(Math.random() * 1000);
      const voucherSeed = new BN(voucherSeedNumber);

      // Get voucher PDA
      const [voucherPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("voucher"),
          wallet.publicKey.toBuffer(),
          merchantPubkey.toBuffer(),
          offerPubkey.toBuffer(),
          voucherSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const tx = await program.methods
        .redeemRewards(voucherSeed)
        .accountsPartial({
          customerAuthority: wallet.publicKey,
          customer: customerPda,
          merchant: merchantPubkey,
          loyaltyProgram: loyaltyProgram,
          mint: mintPda,
          customerTokenAccount,
          redemptionOffer: offerPubkey,
          voucher: voucherPda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, voucherPda: voucherPda.toBase58() };
    },
    onSuccess: (data) => {
      toast.success("Rewards redeemed successfully!", {
        description: "Your voucher has been created",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["customerAccount"] });
      queryClient.invalidateQueries({ queryKey: ["customerBalance"] });
      queryClient.invalidateQueries({ queryKey: ["customerVouchers"] });

      return data;
    },
    onError: (error: any) => {
      console.error("Redeem error:", error);

      let errorMessage = "Please try again";

      // Handle specific error cases
      if (error.message?.includes("InsufficientBalance")) {
        errorMessage = "Not enough tokens to redeem this offer";
      } else if (error.message?.includes("OfferNotAvailable")) {
        errorMessage = "This offer is no longer available";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error("Failed to redeem rewards", {
        description: errorMessage,
      });
    },
  });
}
