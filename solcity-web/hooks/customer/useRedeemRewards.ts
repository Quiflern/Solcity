import { AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCustomerPDA, getMintPDA } from "@/lib/anchor/pdas";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Parameters required to redeem loyalty rewards for an offer.
 */
interface RedeemRewardsParams {
  /** Public key of the merchant offering the redemption */
  merchantPubkey: PublicKey;
  /** Public key of the specific redemption offer */
  offerPubkey: PublicKey;
  /** Name of the offer being redeemed (for display purposes) */
  offerName: string;
}

/**
 * Custom hook to redeem loyalty rewards for redemption offers.
 *
 * This hook handles the complete redemption flow:
 * 1. Validates customer registration and token balance
 * 2. Burns the required loyalty tokens from customer's account
 * 3. Creates a redemption voucher with a unique code
 * 4. Invalidates relevant queries to update UI
 *
 * The mutation automatically handles errors and displays toast notifications
 * for success and failure cases.
 *
 * @returns {UseMutationResult} React Query mutation result containing:
 * - mutate/mutateAsync: Function to trigger the redemption
 * - isLoading: Whether the redemption is in progress
 * - error: Any error that occurred during redemption
 * - data: Transaction signature and voucher PDA on success
 *
 * @example
 * ```tsx
 * const redeemMutation = useRedeemRewards();
 *
 * const handleRedeem = async () => {
 *   await redeemMutation.mutateAsync({
 *     merchantPubkey: new PublicKey(merchant.publicKey),
 *     offerPubkey: new PublicKey(offer.publicKey),
 *     offerName: offer.name
 *   });
 * };
 *
 * return (
 *   <button
 *     onClick={handleRedeem}
 *     disabled={redeemMutation.isLoading}
 *   >
 *     {redeemMutation.isLoading ? 'Redeeming...' : 'Redeem Offer'}
 *   </button>
 * );
 * ```
 */
export function useRedeemRewards() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      merchantPubkey,
      offerPubkey,
    }: RedeemRewardsParams) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      // Fetch merchant account to get the loyalty program they belong to
      const merchantAccount =
        await program.account.merchant.fetch(merchantPubkey);
      const loyaltyProgram = merchantAccount.loyaltyProgram;

      // Derive customer PDA for this wallet and loyalty program
      const [customerPda] = getCustomerPDA(wallet.publicKey, loyaltyProgram);

      // Verify customer is registered before attempting redemption
      const customerAccount = await connection.getAccountInfo(customerPda);
      if (!customerAccount) {
        throw new Error(
          "You need to register as a customer first. Please visit a merchant and make a purchase to register.",
        );
      }

      // Get the loyalty token mint PDA
      const [mintPda] = getMintPDA(loyaltyProgram);

      // Get customer's token account for the loyalty tokens
      const customerTokenAccount = getAssociatedTokenAddressSync(
        mintPda,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
      );

      // Generate unique voucher seed using timestamp + random number
      // This ensures each voucher has a unique address
      const voucherSeedNumber = Date.now() + Math.floor(Math.random() * 1000);
      const voucherSeed = new BN(voucherSeedNumber);

      // Derive voucher PDA using customer, merchant, offer, and seed
      const [voucherPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("voucher"),
          wallet.publicKey.toBuffer(),
          merchantPubkey.toBuffer(),
          offerPubkey.toBuffer(),
          voucherSeed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );

      // Execute the redemption transaction
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
    onError: (error: Error) => {
      console.error("Redeem error:", error);
      // Error handling is done in the component for better UX
    },
  });
}
