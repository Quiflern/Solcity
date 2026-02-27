"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Gift } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useCustomerAccount } from "@/hooks/customer/useCustomerAccount";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { useMerchantRedemptionOffers } from "@/hooks/merchant/useMerchantRedemptionOffers";
import { useMerchantRewardRules } from "@/hooks/merchant/useMerchantRewardRules";
import { useSolcityProgram } from "@/hooks/program/useSolcityProgram";

/**
 * Merchant data structure fetched from blockchain
 */
interface MerchantData {
  publicKey: PublicKey;
  authority: PublicKey;
  loyaltyProgram: PublicKey;
  name: string;
  category: string;
  description: string;
  avatarUrl: string;
  rewardRate: number;
  totalIssued: number;
  totalRedeemed: number;
  isActive: boolean;
  createdAt: number;
}

/**
 * Merchant Detail Page
 *
 * Displays comprehensive information about a specific merchant including:
 * - Business details and description
 * - Reward rules and earning rates
 * - Available redemption offers
 * - Registration functionality for customers
 * - QR code for merchant scanning
 * - On-chain statistics
 *
 * Features different views for:
 * - Merchant owners (shows their QR code)
 * - Registered customers (shows registered status)
 * - Unregistered visitors (shows registration CTA)
 *
 * @returns Merchant detail page with registration and rewards information
 */
export default function MerchantDetailPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const { program } = useSolcityProgram();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { merchantAccount } = useMerchantAccount();
  const { customerAccount, refetch: refetchCustomer } = useCustomerAccount();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch reward rules for this merchant
  const { data: rules = [], isLoading: rulesLoading } = useMerchantRewardRules(
    merchant ? merchant.publicKey : null,
  );

  // Fetch redemption offers for this merchant
  const { data: offers = [], isLoading: offersLoading } =
    useMerchantRedemptionOffers(merchant ? merchant.publicKey : null);

  /**
   * Handles customer registration at this merchant
   * Creates a customer account on-chain linked to the merchant's loyalty program
   */
  const handleRegisterCustomer = async () => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (customerAccount) {
      toast.info("You're already registered!");
      return;
    }

    if (!merchant) {
      toast.error("Merchant data not loaded");
      return;
    }

    setIsRegistering(true);
    const loadingToast = toast.loading("Registering as customer...");

    try {
      // Get the loyalty program PDA from the merchant's loyalty program
      const merchantData = await program.account.merchant.fetch(
        merchant.publicKey,
      );
      const loyaltyProgramPubkey = merchantData.loyaltyProgram;

      const tx = await program.methods
        .registerCustomer()
        .accountsPartial({
          customerAuthority: publicKey,
          loyaltyProgram: loyaltyProgramPubkey,
        })
        .rpc();

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      toast.dismiss(loadingToast);
      toast.success("Successfully registered!", {
        description: "You can now earn rewards at this merchant",
        duration: 4000,
      });

      // Refetch customer account
      setTimeout(() => refetchCustomer(), 1000);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      toast.dismiss(loadingToast);

      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("already in use")) {
        toast.info("You're already registered!", { duration: 4000 });
        refetchCustomer();
      } else {
        toast.error("Registration failed", {
          description: errorMessage || "Please try again",
          duration: 5000,
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Fetches merchant data from blockchain when component mounts or merchantId changes
   */
  useEffect(() => {
    const fetchMerchant = async () => {
      if (!merchantId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Create a read-only program instance if no wallet is connected
        let programToUse = program;

        if (!programToUse) {
          const { AnchorProvider, Program } = await import("@coral-xyz/anchor");
          const IDL_JSON = (await import("@/lib/anchor/idl/solcity_protocol.json")).default;

          // Create a read-only wallet for public data access
          const readOnlyWallet = {
            publicKey: null,
            signTransaction: async () => {
              throw new Error("Read-only wallet cannot sign");
            },
            signAllTransactions: async () => {
              throw new Error("Read-only wallet cannot sign");
            },
          } as any;

          const provider = new AnchorProvider(
            connection,
            readOnlyWallet,
            { commitment: "confirmed" },
          );

          programToUse = new Program(
            IDL_JSON as any,
            provider,
          );
        }

        const merchantPubkey = new PublicKey(merchantId);
        const merchantAccount =
          await programToUse.account.merchant.fetch(merchantPubkey);

        // Transform blockchain data to component state format
        setMerchant({
          publicKey: merchantPubkey,
          authority: merchantAccount.authority,
          loyaltyProgram: merchantAccount.loyaltyProgram,
          name: merchantAccount.name,
          category: merchantAccount.category || "Other",
          description: merchantAccount.description || "",
          avatarUrl: merchantAccount.avatarUrl || "",
          rewardRate: merchantAccount.rewardRate.toNumber(),
          totalIssued: merchantAccount.totalIssued.toNumber(),
          totalRedeemed: merchantAccount.totalRedeemed.toNumber(),
          isActive: merchantAccount.isActive,
          createdAt: merchantAccount.createdAt.toNumber(),
        });
      } catch (err: unknown) {
        console.error("Error fetching merchant:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load merchant";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchant();
  }, [program, merchantId, connection]);

  // Generate avatar URL
  const getAvatarUrl = (avatarCode: string, businessName: string) => {
    if (!avatarCode) {
      return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(businessName)}&backgroundColor=d0ff14`;
    }
    if (avatarCode.startsWith("http://") || avatarCode.startsWith("https://")) {
      return avatarCode;
    }
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarCode)}&backgroundColor=d0ff14`;
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Format number with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
  };

  // All rules and active rules
  const activeRules = rules.filter((r) => r.isActive);

  // Debug logging
  console.log("Total rules:", rules.length);
  console.log("Active rules:", activeRules.length);
  console.log("Rules data:", rules);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading merchant...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load merchant</p>
            <p className="text-text-secondary text-sm mb-4">
              {error || "Merchant not found"}
            </p>
            <Link href="/explore" className="text-accent hover:underline">
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>

        {/* Merchant Header */}
        <header className="flex gap-10 mb-16 items-start">
          <div className="w-[120px] h-[120px] bg-panel border border-border flex items-center justify-center rounded-xl overflow-hidden">
            {/* biome-ignore lint/performance/noImgElement: Avatar from external source */}
            <img
              src={getAvatarUrl(merchant.avatarUrl, merchant.name)}
              alt={merchant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <span className="text-accent text-xs uppercase tracking-widest mb-2 block">
              {merchant.category}
            </span>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-medium tracking-tight">
                {merchant.name}
              </h1>
              <div className="bg-accent text-black text-[10px] font-extrabold px-2 py-1 rounded-sm tracking-wider">
                VERIFIED
              </div>
            </div>
            <p className="text-text-secondary leading-relaxed max-w-[600px] mb-6">
              {merchant.description || "No description provided"}
            </p>
            <span className="text-sm text-text-secondary">
              Onboarded {formatDate(merchant.createdAt)}
            </span>
          </div>
        </header>

        {/* Program Summary */}
        <div className="grid grid-cols-3 gap-px bg-border border border-border mb-16">
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">
              Base Reward Rate
            </span>
            <div className="text-2xl font-semibold text-accent">
              {(merchant.rewardRate / 100).toFixed(1)} SLCY / $
            </div>
          </div>
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">
              Total Issued
            </span>
            <div className="text-2xl font-semibold text-accent">
              {formatNumber(merchant.totalIssued)} SLCY
            </div>
          </div>
          <div className="bg-panel p-8">
            <span className="text-[0.7rem] uppercase text-text-secondary mb-2 block">
              Active Rules
            </span>
            <div className="text-2xl font-semibold text-accent">
              {activeRules.length}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-[2fr_1fr] gap-12">
          {/* Main Content */}
          <div>
            {/* Redemption Offers */}
            <section className="mb-12">
              <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                <span className="w-1 h-[18px] bg-accent" />
                Redemption Offers ({offers.filter((o) => o.isActive).length}{" "}
                available)
              </h2>
              {offersLoading ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="bg-panel border border-border p-8 text-center rounded-lg">
                  <Gift className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
                  <p className="text-text-secondary">
                    No redemption offers available yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {offers
                    .filter((offer) => offer.isActive)
                    .map((offer) => {
                      const now = Date.now() / 1000;
                      const isExpired =
                        offer.expiration && offer.expiration.toNumber() < now;
                      const isSoldOut =
                        offer.quantityLimit &&
                        offer.quantityClaimed >= offer.quantityLimit;
                      const isAvailable = !isExpired && !isSoldOut;

                      return (
                        <div
                          key={offer.publicKey.toString()}
                          className={`bg-panel border p-6 transition-all hover:-translate-y-0.5 rounded-lg ${isAvailable
                            ? "border-border hover:border-accent"
                            : "border-border/50 opacity-60"
                            }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            {offer.icon ? (
                              <IconRenderer
                                icon={offer.icon}
                                className="w-8 h-8 text-accent"
                              />
                            ) : (
                              <Gift className="w-8 h-8 text-accent" />
                            )}
                            <div className="flex flex-col gap-2 items-end">
                              <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded font-semibold">
                                {offer.cost.toString()} SLCY
                              </span>
                              {!isAvailable && (
                                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                                  {isSoldOut ? "Sold Out" : "Expired"}
                                </span>
                              )}
                            </div>
                          </div>
                          <h4 className="text-base mb-2 font-semibold">
                            {offer.name}
                          </h4>
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {offer.description}
                          </p>
                          {offer.quantityLimit && (
                            <div className="text-xs text-text-secondary mb-2">
                              {offer.quantityClaimed.toString()} /{" "}
                              {offer.quantityLimit.toString()} claimed
                            </div>
                          )}
                          {offer.expiration && (
                            <div className="text-xs text-text-secondary">
                              Expires:{" "}
                              {new Date(
                                offer.expiration.toNumber() * 1000,
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* Active Reward Rules */}
            <section className="mb-12">
              <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                <span className="w-1 h-[18px] bg-accent" />
                Reward Rules ({rules.length} total, {activeRules.length} active)
              </h2>
              {rulesLoading ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary">Loading rules...</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="bg-panel border border-border p-8 text-center">
                  <p className="text-text-secondary">No reward rules yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {rules.map((rule) => (
                    <Card
                      key={rule.ruleId.toString()}
                      className={`${!rule.isActive ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <svg
                          className="w-6 h-6 stroke-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex gap-2">
                          <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                            {rule.multiplier / 100}x
                          </span>
                          {!rule.isActive && (
                            <span className="text-xs text-text-secondary bg-text-secondary/10 px-2 py-1 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-base mb-2 font-semibold">
                        {rule.name}
                      </h4>
                      <p className="text-sm text-text-secondary mb-3">
                        Min Purchase: ${(rule.minPurchase / 100).toFixed(2)}
                      </p>
                      <div className="text-xs text-text-secondary">
                        {new Date(rule.startTime * 1000).toLocaleDateString()} -{" "}
                        {new Date(rule.endTime * 1000).toLocaleDateString()}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Stats Section */}
            <section>
              <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                <span className="w-1 h-[18px] bg-accent" />
                Merchant Statistics
              </h2>
              <div className="bg-panel border border-border p-8 rounded-lg">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-text-secondary mb-2">
                      Total Tokens Issued
                    </p>
                    <p className="text-2xl font-semibold text-accent">
                      {formatNumber(merchant.totalIssued)} SLCY
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-2">
                      Total Tokens Redeemed
                    </p>
                    <p className="text-2xl font-semibold text-accent">
                      {formatNumber(merchant.totalRedeemed)} SLCY
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-2">
                      Redemption Rate
                    </p>
                    <p className="text-2xl font-semibold text-accent">
                      {merchant.totalIssued > 0
                        ? (
                          (merchant.totalRedeemed / merchant.totalIssued) *
                          100
                        ).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Status</p>
                    <p className="text-2xl font-semibold text-accent">
                      {merchant.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {merchant && (
              <>
                {/* CTA Widget with QR Code or Register Button */}
                {publicKey &&
                  merchantAccount &&
                  merchant.authority.toString() === publicKey.toString() ? (
                  // Show QR code for the merchant owner
                  <div className="bg-accent text-black p-10 text-center relative overflow-hidden">
                    <h3 className="text-xl font-bold mb-6">
                      Your Merchant QR Code
                    </h3>
                    <div className="w-[180px] h-[180px] bg-white mx-auto mb-6 flex items-center justify-center p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      {/* biome-ignore lint/performance/noImgElement: External QR code API requires img element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(merchant.publicKey.toString())}`}
                        alt="Merchant QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-sm opacity-80">
                      Customers scan this code to register and earn rewards at
                      your business.
                    </p>
                    <div className="mt-4 pt-4 border-t border-black/20">
                      <p className="text-xs opacity-60">
                        As the merchant owner, you cannot register as a customer
                        at your own store.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Show register/earn CTA for customers
                  <div className="bg-accent text-black p-10 text-center relative overflow-hidden">
                    <h3 className="text-xl font-bold mb-6">
                      Start Earning Here
                    </h3>
                    <div className="w-[180px] h-[180px] bg-white mx-auto mb-6 flex items-center justify-center p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      {/* biome-ignore lint/performance/noImgElement: External QR code API requires img element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(merchant.publicKey.toString())}`}
                        alt="Merchant QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    {publicKey ? (
                      customerAccount ? (
                        <div className="bg-black/20 border border-black/30 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-semibold">
                              You're Registered!
                            </span>
                          </div>
                          <p className="text-sm opacity-80">
                            Start earning rewards on your next purchase
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRegisterCustomer}
                          disabled={isRegistering}
                          className="bg-black text-accent px-6 py-3 rounded-lg font-semibold hover:bg-black/90 transition-colors w-full mb-4 disabled:opacity-50"
                        >
                          {isRegistering
                            ? "Registering..."
                            : "Register to Earn Rewards"}
                        </button>
                      )
                    ) : (
                      <p className="text-sm opacity-80 mb-4">
                        Connect your wallet to register and start earning
                        rewards at this merchant.
                      </p>
                    )}
                    <p className="text-sm opacity-80">
                      Scan this code at checkout to earn rewards instantly.
                    </p>
                  </div>
                )}

                {/* On-Chain Verification Widget */}
                <div className="bg-panel border border-border p-6 rounded-lg">
                  <h4 className="text-sm mb-6 tracking-wider uppercase text-text-secondary">
                    On-Chain Verification
                  </h4>

                  <div className="mb-5">
                    <span className="text-[0.65rem] uppercase text-text-secondary block mb-1.5">
                      Merchant Address
                    </span>
                    <span className="font-mono text-xs text-text break-all bg-black p-2.5 border border-border block rounded">
                      {merchant.publicKey.toString()}
                    </span>
                  </div>

                  <div className="mb-5">
                    <span className="text-[0.65rem] uppercase text-text-secondary block mb-1.5">
                      Authority
                    </span>
                    <span className="font-mono text-xs text-text break-all bg-black p-2.5 border border-border block rounded">
                      {merchant.authority.toString()}
                    </span>
                  </div>

                  <div className="mb-5">
                    <span className="text-[0.65rem] uppercase text-text-secondary block mb-1.5">
                      Loyalty Program
                    </span>
                    <span className="font-mono text-xs text-text break-all bg-black p-2.5 border border-border block rounded">
                      {merchant.loyaltyProgram.toString()}
                    </span>
                  </div>

                  <a
                    href={`https://explorer.solana.com/address/${merchant.publicKey.toString()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-xs flex items-center gap-1.5 mt-4 hover:underline"
                  >
                    View on Solana Explorer
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
