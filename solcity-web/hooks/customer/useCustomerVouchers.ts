import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getProgram } from "@/lib/anchor/setup";

/**
 * Represents a redemption voucher issued to a customer.
 *
 * Vouchers are created when customers redeem their loyalty points for offers.
 * They contain all the information needed to validate and use the redemption.
 */
export interface Voucher {
  /** Public key of the voucher account */
  publicKey: string;
  /** Public key of the customer who owns this voucher */
  customer: string;
  /** Public key of the merchant who issued this voucher */
  merchant: string;
  /** Public key of the redemption offer this voucher is for */
  redemptionOffer: string;
  /** Name of the merchant */
  merchantName: string;
  /** Name of the offer */
  offerName: string;
  /** Description of what the offer provides */
  offerDescription: string;
  /** Cost in loyalty points that was paid for this voucher */
  cost: number;
  /** Unique redemption code to validate the voucher */
  redemptionCode: string;
  /** Unix timestamp when the voucher was created */
  createdAt: number;
  /** Unix timestamp when the voucher expires */
  expiresAt: number;
  /** Whether the voucher has been used */
  isUsed: boolean;
  /** Unix timestamp when the voucher was used, null if not used */
  usedAt: number | null;
}

/**
 * Custom hook to fetch all redemption vouchers for the connected customer.
 *
 * This hook queries the blockchain for all voucher accounts owned by the connected
 * wallet. Vouchers are created when customers redeem loyalty points for offers and
 * can be used at participating merchants.
 *
 * @returns {UseQueryResult<Voucher[]>} React Query result containing:
 * - data: Array of voucher objects with all redemption details
 * - isLoading: Whether the query is currently loading
 * - error: Any error that occurred during the query
 * - refetch: Function to manually refetch vouchers
 *
 * @example
 * ```tsx
 * const { data: vouchers, isLoading } = useCustomerVouchers();
 *
 * if (isLoading) return <div>Loading vouchers...</div>;
 *
 * return (
 *   <div>
 *     {vouchers?.map(voucher => (
 *       <VoucherCard key={voucher.publicKey} voucher={voucher} />
 *     ))}
 *   </div>
 * );
 * ```
 */
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

      // Fetch all voucher accounts where this wallet is the customer
      // Uses memcmp to filter by the customer field (offset 8 after discriminator)
      const vouchers = await program.account.redemptionVoucher.all([
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ]);

      // Transform blockchain data into a more usable format
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
