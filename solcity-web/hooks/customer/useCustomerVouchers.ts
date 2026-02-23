import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getProgram } from "@/lib/anchor/setup";
import { PublicKey } from "@solana/web3.js";

export interface Voucher {
  publicKey: string;
  customer: string;
  merchant: string;
  redemptionOffer: string;
  merchantName: string;
  offerName: string;
  offerDescription: string;
  cost: number;
  redemptionCode: string;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  usedAt: number | null;
}

export function useCustomerVouchers() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useQuery({
    queryKey: ["customerVouchers", wallet.publicKey?.toBase58()],
    queryFn: async () => {
      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = getProgram(provider);

      // Fetch all voucher accounts for this customer
      const vouchers = await program.account.redemptionVoucher.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      return vouchers.map((v) => ({
        publicKey: v.publicKey.toBase58(),
        customer: v.account.customer.toBase58(),
        merchant: v.account.merchant.toBase58(),
        redemptionOffer: v.account.redemptionOffer.toBase58(),
        merchantName: v.account.merchantName,
        offerName: v.account.offerName,
        offerDescription: v.account.offerDescription,
        cost: v.account.cost.toNumber(),
        redemptionCode: v.account.redemptionCode,
        createdAt: v.account.createdAt.toNumber(),
        expiresAt: v.account.expiresAt.toNumber(),
        isUsed: v.account.isUsed,
        usedAt: v.account.usedAt ? v.account.usedAt.toNumber() : null,
      })) as Voucher[];
    },
    enabled: !!wallet.publicKey,
    staleTime: 30000,
  });
}
