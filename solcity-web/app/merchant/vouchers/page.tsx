"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import {
  useMerchantVouchers,
  type MerchantVoucher,
} from "@/hooks/merchant/useMerchantVouchers";
import {
  useUpdateVoucherStatus,
  type VoucherStatus,
} from "@/hooks/merchant/useUpdateVoucherStatus";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

/**
 * Merchant Vouchers Management Page
 *
 * Allows merchants to:
 * - View all customer vouchers
 * - Search vouchers by code or customer
 * - Filter by status (all, active, used, expired)
 * - Update voucher status (mark as used, revoke, reactivate)
 *
 * @returns Voucher management component
 */
export default function MerchantVouchersPage() {
  const { publicKey } = useWallet();
  const { merchantAccount, isLoading: merchantLoading, isRegistered } = useMerchantAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used" | "expired">("all");
  const [selectedVoucher, setSelectedVoucher] = useState<MerchantVoucher | null>(null);

  // Get merchant PDA
  const merchantPDA = publicKey
    ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
    : null;

  const { data: vouchers = [], isLoading: vouchersLoading, refetch } = useMerchantVouchers(merchantPDA);
  const updateStatusMutation = useUpdateVoucherStatus();

  const isLoading = merchantLoading || vouchersLoading;

  /**
   * Get voucher status based on current state
   */
  const getVoucherStatus = (voucher: MerchantVoucher): "active" | "used" | "expired" => {
    if (voucher.isUsed) return "used";
    const now = Date.now() / 1000;
    if (now > voucher.expiresAt) return "expired";
    return "active";
  };

  /**
   * Filter vouchers based on search and status
   */
  const filteredVouchers = vouchers.filter((voucher) => {
    // Search filter
    const matchesSearch =
      voucher.redemptionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.offerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === "all") return true;
    return getVoucherStatus(voucher) === statusFilter;
  });

  /**
   * Handle voucher status update
   */
  const handleStatusUpdate = async (
    voucher: MerchantVoucher,
    status: VoucherStatus
  ) => {
    if (!merchantPDA) return;

    try {
      await updateStatusMutation.mutateAsync({
        voucherPubkey: new PublicKey(voucher.publicKey),
        merchantPubkey: merchantPDA,
        status,
      });

      setSelectedVoucher(null);
      refetch();
    } catch (error: any) {
      console.error("Failed to update voucher status:", error);
      toast.error("Failed to update voucher status", {
        duration: 3000,
      });
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", { duration: 2000 });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading vouchers...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isRegistered) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-panel border border-border rounded-xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Not Registered</h2>
              <p className="text-text-secondary mb-8">
                You need to register as a merchant to manage vouchers
              </p>
              <Link
                href="/merchant/register"
                className="inline-block bg-accent text-bg-primary px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Register as Merchant
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="max-w-[1400px] mx-auto px-8 w-full py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Customer Vouchers</h1>
            <p className="text-text-secondary text-sm">
              Manage and track all customer redemption vouchers
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by code, customer, or offer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-panel border border-border rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:border-accent"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "active", "used", "expired"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${statusFilter === filter
                    ? "bg-accent text-black"
                    : "bg-panel border border-border text-text hover:border-accent"
                    }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-panel border border-border rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-1">Total Vouchers</div>
              <div className="text-2xl font-bold">{vouchers.length}</div>
            </div>
            <div className="bg-panel border border-border rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-1">Active</div>
              <div className="text-2xl font-bold text-accent">
                {vouchers.filter((v) => getVoucherStatus(v) === "active").length}
              </div>
            </div>
            <div className="bg-panel border border-border rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-1">Used</div>
              <div className="text-2xl font-bold">
                {vouchers.filter((v) => getVoucherStatus(v) === "used").length}
              </div>
            </div>
            <div className="bg-panel border border-border rounded-lg p-4">
              <div className="text-xs text-text-secondary mb-1">Expired</div>
              <div className="text-2xl font-bold text-red-400">
                {vouchers.filter((v) => getVoucherStatus(v) === "expired").length}
              </div>
            </div>
          </div>

          {/* Vouchers Table */}
          {filteredVouchers.length === 0 ? (
            <div className="bg-panel border border-border rounded-xl p-12 text-center">
              <Ticket className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                {searchQuery || statusFilter !== "all"
                  ? "No vouchers match your filters"
                  : "No vouchers yet"}
              </p>
            </div>
          ) : (
            <div className="bg-panel border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/2">
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Code
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Customer
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Offer
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Cost
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Created
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Expires
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Status
                    </th>
                    <th className="text-left text-[0.7rem] uppercase text-text-secondary py-5 px-6 border-b border-border">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((voucher) => {
                    const status = getVoucherStatus(voucher);
                    return (
                      <tr
                        key={voucher.publicKey}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-5 px-6 border-b border-border">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-accent">
                              {voucher.redemptionCode}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(voucher.redemptionCode)}
                              className="text-text-secondary hover:text-accent transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-5 px-6 border-b border-border">
                          <code className="text-xs font-mono text-text-secondary">
                            {voucher.customer.slice(0, 4)}...{voucher.customer.slice(-4)}
                          </code>
                        </td>
                        <td className="py-5 px-6 border-b border-border text-sm">
                          {voucher.offerName}
                        </td>
                        <td className="py-5 px-6 border-b border-border text-sm">
                          {voucher.cost} SLCY
                        </td>
                        <td className="py-5 px-6 border-b border-border text-sm text-text-secondary">
                          {new Date(voucher.createdAt * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-6 border-b border-border text-sm text-text-secondary">
                          {new Date(voucher.expiresAt * 1000).toLocaleDateString()}
                        </td>
                        <td className="py-5 px-6 border-b border-border">
                          <span
                            className={`text-[0.7rem] px-2 py-1 rounded uppercase font-semibold ${status === "active"
                              ? "bg-accent/10 text-accent"
                              : status === "used"
                                ? "bg-gray-500/10 text-gray-400"
                                : "bg-red-500/10 text-red-400"
                              }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-5 px-6 border-b border-border">
                          {status === "active" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(voucher, "Used")}
                                disabled={updateStatusMutation.isPending}
                                className="text-xs px-3 py-1 rounded bg-accent text-black hover:bg-accent/90 transition-colors disabled:opacity-50"
                              >
                                Mark Used
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(voucher, "Revoked")}
                                disabled={updateStatusMutation.isPending}
                                className="text-xs px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                              >
                                Revoke
                              </button>
                            </div>
                          )}
                          {status === "used" && voucher.usedAt && (
                            <span className="text-xs text-text-secondary">
                              {new Date(voucher.usedAt * 1000).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
