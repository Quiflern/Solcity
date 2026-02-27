"use client";

import { PublicKey } from "@solana/web3.js";
import { Coins, Gift, Package, Percent, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { IconRenderer } from "@/contexts/IconPickerContext";
import { useCustomerAccount } from "@/hooks/customer/useCustomerAccount";
import {
  useCustomerVouchers,
  type Voucher,
} from "@/hooks/customer/useCustomerVouchers";
import { useRedeemRewards } from "@/hooks/customer/useRedeemRewards";
import { useAllRedemptionOffers } from "@/hooks/offers/useAllRedemptionOffers";
import { useSolcityProgram } from "@/hooks/program/useSolcityProgram";

/**
 * Rewards Redemption Page
 *
 * Allows customers to:
 * - Browse available redemption offers from all merchants
 * - Redeem rewards using earned SLCY tokens
 * - View redemption history and active vouchers
 * - Display voucher QR codes for merchant scanning
 *
 * Features two tabs:
 * - Marketplace: Browse and redeem available offers
 * - History: View past redemptions and voucher status
 *
 * @returns Redemption marketplace and history component
 */
export default function RedeemPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"marketplace" | "history">(
    "marketplace",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"confirm" | "success">("confirm");
  const [selectedReward, setSelectedReward] = useState({
    name: "",
    cost: 0,
    publicKey: "",
    merchantPubkey: "",
  });
  const [merchantNames, setMerchantNames] = useState<Record<string, string>>(
    {},
  );
  const [merchantAvatars, setMerchantAvatars] = useState<
    Record<string, string>
  >({});
  const [redeemSignature, setRedeemSignature] = useState("");
  const [voucherAddress, setVoucherAddress] = useState("");
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Fetch real data from blockchain
  const { data: blockchainOffers = [], isLoading: offersLoading } =
    useAllRedemptionOffers();
  const { customerAccount, isLoading: customerLoading } = useCustomerAccount();
  const { data: vouchers = [], isLoading: vouchersLoading } =
    useCustomerVouchers();
  const { program } = useSolcityProgram();
  const redeemMutation = useRedeemRewards();

  // Calculate current balance (earned - redeemed)
  const currentBalance = customerAccount
    ? Number(customerAccount.totalEarned) -
    Number(customerAccount.totalRedeemed)
    : 0;

  /**
   * Fetches merchant names and avatars for all offers
   * Runs when program or offers change
   */
  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!program || blockchainOffers.length === 0) return;

      const names: Record<string, string> = {};
      const avatars: Record<string, string> = {};

      for (const offer of blockchainOffers) {
        try {
          const merchantAccount = await program.account.merchant.fetch(
            offer.merchant,
          );
          names[offer.merchant.toString()] = merchantAccount.name;
          avatars[offer.merchant.toString()] = merchantAccount.avatarUrl;
        } catch (err) {
          console.error("Error fetching merchant:", err);
          names[offer.merchant.toString()] = "Unknown Merchant";
          avatars[offer.merchant.toString()] = "";
        }
      }

      setMerchantNames(names);
      setMerchantAvatars(avatars);
    };

    fetchMerchantData();
  }, [program, blockchainOffers]);

  /**
   * Opens the redemption confirmation modal
   * @param name - Offer name
   * @param cost - Cost in SLCY tokens
   * @param publicKey - Offer account public key
   * @param merchantPubkey - Merchant account public key
   */
  const openRedeemModal = (
    name: string,
    cost: number,
    publicKey: string = "",
    merchantPubkey: string = "",
  ) => {
    setSelectedReward({ name, cost, publicKey, merchantPubkey });
    setModalView("confirm");
    setModalOpen(true);
  };

  /**
   * Closes the redemption modal
   */
  const closeModal = () => {
    setModalOpen(false);
  };

  /**
   * Opens the voucher detail modal
   * @param voucherAddress - Voucher account public key
   */
  const openVoucherModal = (voucherAddress: string) => {
    const voucher = vouchers.find((v) => v.publicKey === voucherAddress);
    if (voucher) {
      setSelectedVoucher(voucher);
      setVoucherModalOpen(true);
    }
  };

  /**
   * Closes the voucher detail modal
   */
  const closeVoucherModal = () => {
    setVoucherModalOpen(false);
    setSelectedVoucher(null);
  };

  /**
   * Copies text to system clipboard
   * @param text - Text to copy
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", { duration: 2000 });
  };

  /**
   * Executes the reward redemption transaction
   * Creates a voucher on-chain and updates customer balance
   */
  const confirmRedeem = async () => {
    if (!selectedReward.publicKey || !selectedReward.merchantPubkey) {
      return;
    }

    try {
      const result = await redeemMutation.mutateAsync({
        merchantPubkey: new PublicKey(selectedReward.merchantPubkey),
        offerPubkey: new PublicKey(selectedReward.publicKey),
        offerName: selectedReward.name,
      });

      setRedeemSignature(result.signature);
      setVoucherAddress(result.voucherPda);
      setModalView("success");
    } catch (error: any) {
      console.error("Redemption failed:", error);

      // Check for insufficient SOL balance error
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("insufficient lamports") || errorMessage.includes("0x1")) {
        toast.error("Insufficient SOL balance (~0.002 SOL needed for fees)", {
          duration: 4000,
        });
      } else if (errorMessage.includes("InsufficientBalance")) {
        toast.error("Not enough SLCY tokens to redeem this offer", {
          duration: 3000,
        });
      } else if (errorMessage.includes("OfferNotAvailable")) {
        toast.error("This offer is no longer available", {
          duration: 3000,
        });
      } else {
        toast.error("Failed to redeem rewards. Please try again.", {
          duration: 3000,
        });
      }
    }
  };

  /**
   * Returns the appropriate icon component for an offer type
   * @param offerType - Offer type object from blockchain
   * @returns React icon component
   */
  const getOfferIcon = (offerType: Record<string, unknown>) => {
    if ("discount" in offerType) return <Percent className="w-8 h-8" />;
    if ("freeProduct" in offerType) return <Package className="w-8 h-8" />;
    if ("cashback" in offerType) return <Coins className="w-8 h-8" />;
    if ("exclusiveAccess" in offerType) return <Ticket className="w-8 h-8" />;
    return <Gift className="w-8 h-8" />;
  };

  // Convert blockchain offers to display format with availability checks
  const blockchainRewardsFormatted = blockchainOffers
    .filter((offer) => offer.isActive) // Only show active offers
    .map((offer) => {
      // Determine offer type from blockchain enum
      let type = "custom";

      if ("discount" in offer.offerType) {
        type = "discount";
      } else if ("freeProduct" in offer.offerType) {
        type = "product";
      } else if ("cashback" in offer.offerType) {
        type = "cashback";
      } else if ("exclusiveAccess" in offer.offerType) {
        type = "exclusive";
      }

      // Check offer availability based on expiration and quantity
      const now = Date.now() / 1000;
      const isExpired = offer.expiration && offer.expiration.toNumber() < now;
      const isSoldOut =
        offer.quantityLimit && offer.quantityClaimed >= offer.quantityLimit;
      const available = !isExpired && !isSoldOut;

      // Use stored icon or fallback to type-based icon
      const iconElement = offer.icon ? (
        <IconRenderer
          key={offer.publicKey.toString()}
          icon={offer.icon}
          className="w-8 h-8"
        />
      ) : (
        getOfferIcon(offer.offerType)
      );

      return {
        id: offer.publicKey.toString(),
        type,
        icon: iconElement,
        merchant: merchantNames[offer.merchant.toString()] || "Loading...",
        merchantAvatar: merchantAvatars[offer.merchant.toString()] || "",
        name: offer.name,
        description: offer.description,
        cost: offer.cost.toNumber(),
        available,
        isMock: false,
        publicKey: offer.publicKey.toString(),
        merchantPubkey: offer.merchant.toString(),
        quantityLimit: offer.quantityLimit
          ? offer.quantityLimit.toNumber()
          : null,
        quantityClaimed: offer.quantityClaimed.toNumber(),
      };
    });

  // Use only blockchain rewards
  const allRewards = blockchainRewardsFormatted;

  // Format vouchers for history display
  const history = vouchers
    .sort((a, b) => b.createdAt - a.createdAt) // Most recent first
    .map((voucher) => ({
      id: voucher.publicKey,
      reward: voucher.offerName,
      merchant: voucher.merchantName,
      amount: `-${voucher.cost.toLocaleString()} SLCY`,
      date: new Date(voucher.createdAt * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: voucher.isUsed ? "used" : "active",
      voucherAddress: voucher.publicKey,
    }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary">
        {/* Page Header */}
        <div className="max-w-[1400px] mx-auto px-8 py-12 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-[2rem] font-extrabold mb-2">Redeem Rewards</h1>
            <p className="text-text-secondary text-sm">
              Exchange your SLCY for products, discounts, and more.
            </p>
          </div>
          <div className="bg-panel border border-border px-8 py-5 rounded-xl flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase text-text-secondary tracking-wider">
              Available Balance
            </span>
            <span className="text-[1.75rem] font-bold text-accent">
              {customerLoading ? (
                <span className="text-text-secondary">Loading...</span>
              ) : (
                <>
                  {currentBalance.toLocaleString()}{" "}
                  <span className="text-sm text-text-secondary">SLCY</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-8 border-b border-border flex gap-10">
          <button
            type="button"
            onClick={() => setActiveTab("marketplace")}
            className={`py-4 text-sm font-medium relative ${activeTab === "marketplace" ? "text-text" : "text-text-secondary"
              }`}
          >
            Marketplace
            {activeTab === "marketplace" && (
              <span className="absolute -bottom-px left-0 w-full h-[2px] bg-accent" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`py-4 text-sm font-medium relative ${activeTab === "history" ? "text-text" : "text-text-secondary"
              }`}
          >
            Redemption History
            {activeTab === "history" && (
              <span className="absolute -bottom-px left-0 w-full h-[2px] bg-accent" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {activeTab === "marketplace" && (
            <>
              {offersLoading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-text-secondary">Loading offers...</p>
                </div>
              )}

              {!offersLoading && (
                <div className="grid grid-cols-3 gap-6">
                  {allRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-panel border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
                    >
                      {/* Header section with merchant */}
                      <div className="p-6 pb-4 border-b border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[0.65rem] uppercase font-bold px-3 py-1.5 rounded-full ${reward.type === "discount"
                              ? "bg-accent/10 text-accent"
                              : reward.type === "product"
                                ? "bg-blue-500/10 text-blue-400"
                                : reward.type === "cashback"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-purple-500/10 text-purple-400"
                              }`}
                          >
                            {reward.type === "discount"
                              ? "Discount"
                              : reward.type === "product"
                                ? "Free Item"
                                : reward.type === "cashback"
                                  ? "Cashback"
                                  : "Exclusive"}
                          </span>
                          <div className="text-xl font-bold text-accent">
                            {reward.cost}{" "}
                            <span className="text-xs text-text-secondary">
                              SLCY
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {reward.merchantAvatar && (
                            // biome-ignore lint/performance/noImgElement: Avatar from external source
                            <img
                              src={reward.merchantAvatar}
                              alt={reward.merchant}
                              className="w-10 h-10 rounded-full object-cover border-2 border-border"
                            />
                          )}
                          <div>
                            <div className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">
                              From
                            </div>
                            <div className="text-sm font-semibold">
                              {reward.merchant}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content section */}
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl shrink-0">{reward.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold leading-tight mb-2">
                              {reward.name}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                              {reward.description}
                            </p>
                          </div>
                        </div>

                        {/* Quantity indicator */}
                        {reward.quantityLimit !== undefined &&
                          reward.quantityLimit !== null ? (
                          <div className="mb-4 flex items-center justify-between text-xs">
                            <span className="text-text-secondary">
                              Available
                            </span>
                            <span className="font-semibold text-text">
                              {Math.max(
                                0,
                                reward.quantityLimit - reward.quantityClaimed,
                              )}{" "}
                              / {reward.quantityLimit}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-4 flex items-center justify-between text-xs">
                            <span className="text-text-secondary">
                              Available
                            </span>
                            <span className="font-semibold text-accent">
                              Unlimited
                            </span>
                          </div>
                        )}

                        {reward.available ? (
                          <button
                            type="button"
                            onClick={() =>
                              openRedeemModal(
                                reward.name,
                                reward.cost,
                                reward.publicKey || "",
                                reward.merchantPubkey || "",
                              )
                            }
                            className="w-full py-3 rounded-lg bg-accent text-black font-semibold text-sm transition-all duration-200 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
                            disabled={reward.isMock}
                          >
                            {reward.isMock ? "Demo Only" : "Redeem Now"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full py-3 rounded-lg border border-border bg-bg-primary text-text-secondary font-semibold text-sm cursor-not-allowed opacity-50"
                          >
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
            <>
              {vouchersLoading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-text-secondary">Loading history...</p>
                </div>
              )}

              {!vouchersLoading && history.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-text-secondary">
                    No redemption history yet
                  </p>
                  <p className="text-text-secondary text-sm mt-2">
                    Start redeeming rewards to see your history here
                  </p>
                </div>
              )}

              {!vouchersLoading && history.length > 0 && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Reward Item
                      </th>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Merchant
                      </th>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Amount
                      </th>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Date
                      </th>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Status
                      </th>
                      <th className="text-left text-xs text-text-secondary uppercase p-4 border-b border-border">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-bg-secondary/30 transition-colors"
                      >
                        <td className="py-5 px-4 border-b border-border text-sm">
                          {item.reward}
                        </td>
                        <td className="py-5 px-4 border-b border-border text-sm">
                          {item.merchant}
                        </td>
                        <td className="py-5 px-4 border-b border-border text-sm">
                          {item.amount}
                        </td>
                        <td className="py-5 px-4 border-b border-border text-sm">
                          {item.date}
                        </td>
                        <td className="py-5 px-4 border-b border-border text-sm">
                          <span
                            className={`px-2 py-1 rounded text-[0.7rem] font-semibold uppercase ${item.status === "used"
                              ? "bg-[rgba(128,128,128,0.1)] text-gray-400"
                              : "bg-[rgba(0,255,128,0.1)] text-[#00ff80]"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-5 px-4 border-b border-border text-sm">
                          <button
                            type="button"
                            onClick={() =>
                              openVoucherModal(item.voucherAddress)
                            }
                            className="text-accent hover:underline text-sm font-medium"
                          >
                            View Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Confirm Modal */}
        <Modal
          isOpen={modalOpen && modalView === "confirm"}
          onClose={closeModal}
          title="Confirm Redemption"
          size="md"
        >
          <div className="space-y-6">
            <div className="bg-bg rounded-lg p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Reward</span>
                <span className="font-medium text-text">
                  {selectedReward.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Cost</span>
                <span className="font-medium text-accent">
                  {selectedReward.cost} SLCY
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Network Fee</span>
                <span className="font-medium text-text">0.000005 SOL</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmRedeem}
                isLoading={redeemMutation.isPending}
                className="flex-1"
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={modalOpen && modalView === "success"}
          onClose={closeModal}
          title="Redemption Successful!"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent text-[2rem]">
                ✓
              </div>
            </div>
            <p className="text-text-secondary text-sm text-center">
              Your voucher has been created and is ready to use.
            </p>
            <div className="bg-bg rounded-lg p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Signature</span>
                <span className="font-medium font-mono text-text">
                  {redeemSignature.slice(0, 4)}...{redeemSignature.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Voucher</span>
                <span className="font-medium font-mono text-text">
                  {voucherAddress.slice(0, 4)}...{voucherAddress.slice(-4)}
                </span>
              </div>
            </div>
            <a
              href={`https://explorer.solana.com/tx/${redeemSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-sm block text-center hover:underline"
            >
              View on Solana Explorer ↗
            </a>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  closeModal();
                  openVoucherModal(voucherAddress);
                }}
                className="flex-1"
              >
                View Voucher
              </Button>
              <Button variant="primary" onClick={closeModal} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </Modal>

        {/* Voucher Modal */}
        <Modal
          isOpen={voucherModalOpen}
          onClose={closeVoucherModal}
          title=""
          size="md"
        >
          {selectedVoucher && (
            <div className="space-y-4">
              {/* USED Alert Message - Outside the card */}
              {selectedVoucher.isUsed && (
                <div className="bg-red-500/90 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-bold uppercase tracking-wider">
                    This voucher has been used
                  </span>
                </div>
              )}

              {/* Voucher Card */}
              <div className="relative flex items-center justify-center py-4">
                <div
                  className="relative w-full max-w-[280px] h-[420px] bg-[rgba(25,25,25,0.95)] rounded-sm p-5 flex flex-col justify-between overflow-hidden"
                  style={{
                    boxShadow: `
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                      0 15px 40px -10px rgba(0, 0, 0, 0.8)
                    `,
                  }}
                >
                  {/* Border gradient */}
                  <div
                    className="absolute -inset-px rounded-sm pointer-events-none opacity-50"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.1), transparent 40%, #d0ff14)",
                      padding: "1px",
                      WebkitMask:
                        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />

                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-accent shadow-[0_0_8px_#d0ff14]" />
                        <span className="font-bold tracking-tight text-sm">
                          SOLCITY
                        </span>
                      </div>
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold mt-0.5">
                        Proof of Redemption
                      </span>
                    </div>

                    {/* Cost badge */}
                    <div
                      className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 flex flex-col items-end"
                      style={{
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                        Cost
                      </span>
                      <span
                        className="font-bold font-mono text-[0.7rem] text-accent"
                        style={{
                          textShadow: "0 0 8px rgba(208, 255, 20, 0.3)",
                        }}
                      >
                        {selectedVoucher.cost} SLCY
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-1">
                        Merchant
                      </span>
                      <h2 className="text-base font-medium text-white tracking-wide">
                        {selectedVoucher.merchantName}
                      </h2>
                    </div>

                    <div className="relative">
                      {/* Accent bar */}
                      <div
                        className="absolute -left-5 w-0.5 h-full bg-accent"
                        style={{ boxShadow: "0 0 10px #d0ff14" }}
                      />
                      <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                        Offer
                      </span>
                      <h1 className="text-lg font-bold text-white leading-tight mb-1">
                        {selectedVoucher.offerName}
                      </h1>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {selectedVoucher.offerDescription}
                      </p>
                    </div>
                  </div>

                  {/* Perforation */}
                  <div className="relative w-full my-3">
                    <svg
                      width="100%"
                      height="8"
                      viewBox="0 0 280 8"
                      preserveAspectRatio="none"
                      className="opacity-40"
                      aria-hidden="true"
                    >
                      <path
                        d="M0,4 L7,0 L14,4 L21,0 L28,4 L35,0 L42,4 L49,0 L56,4 L63,0 L70,4 L77,0 L84,4 L91,0 L98,4 L105,0 L112,4 L119,0 L126,4 L133,0 L140,4 L147,0 L154,4 L161,0 L168,4 L175,0 L182,4 L189,0 L196,4 L203,0 L210,4 L217,0 L224,4 L231,0 L238,4 L245,0 L252,4 L259,0 L266,4 L273,0 L280,4"
                        stroke="#666"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Bottom section */}
                  <div className="flex flex-row items-end justify-between gap-3">
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                          Redemption Code
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-sm text-accent font-bold tracking-widest">
                            {selectedVoucher.redemptionCode}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedVoucher.redemptionCode)}
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="Copy code"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#888] text-[0.6rem] uppercase tracking-[0.15em] font-semibold block mb-0.5">
                          Expires
                        </span>
                        <span className="text-[#eee] text-xs font-medium">
                          {new Date(
                            selectedVoucher.expiresAt * 1000,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="w-[70px] h-[70px] bg-white rounded p-1 shadow-lg flex items-center justify-center shrink-0">
                      {/* biome-ignore lint/performance/noImgElement: External QR code API requires img element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(selectedVoucher.redemptionCode)}`}
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                onClick={closeVoucherModal}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
