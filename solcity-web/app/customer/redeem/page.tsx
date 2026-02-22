"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAllRedemptionOffers } from "@/hooks/useAllRedemptionOffers";
import { useSolcityProgram } from "@/hooks/useSolcityProgram";
import { Percent, Package, Coins, Ticket, Gift } from "lucide-react";
import { IconRenderer } from "@/contexts/IconPickerContext";

export default function RedeemPage() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "history">(
    "marketplace",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"confirm" | "success">("confirm");
  const [selectedReward, setSelectedReward] = useState({ name: "", cost: 0, publicKey: "" });
  const [merchantNames, setMerchantNames] = useState<Record<string, string>>({});

  // Fetch real offers from blockchain
  const { data: blockchainOffers = [], isLoading: offersLoading } = useAllRedemptionOffers();
  const { program } = useSolcityProgram();

  // Fetch merchant names for blockchain offers
  useEffect(() => {
    const fetchMerchantNames = async () => {
      if (!program || blockchainOffers.length === 0) return;

      const names: Record<string, string> = {};

      for (const offer of blockchainOffers) {
        try {
          const merchantAccount = await program.account.merchant.fetch(offer.merchant);
          names[offer.merchant.toString()] = merchantAccount.name;
        } catch (err) {
          console.error("Error fetching merchant:", err);
          names[offer.merchant.toString()] = "Unknown Merchant";
        }
      }

      setMerchantNames(names);
    };

    fetchMerchantNames();
  }, [program, blockchainOffers]);

  const openRedeemModal = (name: string, cost: number, publicKey: string = "") => {
    setSelectedReward({ name, cost, publicKey });
    setModalView("confirm");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const confirmRedeem = () => {
    // TODO: Integrate with blockchain redeem function
    setModalView("success");
  };

  // Mock rewards (fallback/demo data)
  const mockRewards = [
    {
      id: "reward-1",
      type: "discount",
      icon: <Percent className="w-8 h-8" />,
      merchant: "Solana Coffee",
      name: "50% Off Any Beverage",
      description:
        "Valid for one large handcrafted drink. Available at all locations.",
      cost: 250,
      available: true,
      isMock: true,
    },
    {
      id: "reward-2",
      type: "product",
      icon: <Package className="w-8 h-8" />,
      merchant: "Solana Store",
      name: "Limited Edition Hat",
      description:
        "Exclusive 'WAGMI' trucker hat from the Fall '24 collection.",
      cost: 1200,
      available: true,
      isMock: true,
    },
    {
      id: "reward-3",
      type: "cashback",
      icon: <Coins className="w-8 h-8" />,
      merchant: "Network Bridge",
      name: "Convert 1.0 SOL",
      description:
        "Direct swap of your reward tokens for SOL sent to your wallet.",
      cost: 15000,
      available: false,
      isMock: true,
    },
    {
      id: "reward-4",
      type: "exclusive",
      icon: <Ticket className="w-8 h-8" />,
      merchant: "Breakpoint '25",
      name: "VIP Pass Entry",
      description:
        "Pre-sale priority access code for the annual developer conference.",
      cost: 5000,
      available: true,
      isMock: true,
    },
    {
      id: "reward-5",
      type: "discount",
      icon: <Percent className="w-8 h-8" />,
      merchant: "Block Burger",
      name: "$10 Dining Credit",
      description: "Applied to any dine-in or take-out order over $20.",
      cost: 800,
      available: true,
      isMock: true,
    },
  ];

  const getOfferIcon = (offerType: any) => {
    if ("discount" in offerType) return <Percent className="w-8 h-8" />;
    if ("freeProduct" in offerType) return <Package className="w-8 h-8" />;
    if ("cashback" in offerType) return <Coins className="w-8 h-8" />;
    if ("exclusiveAccess" in offerType) return <Ticket className="w-8 h-8" />;
    return <Gift className="w-8 h-8" />;
  };

  // Convert blockchain offers to display format
  const blockchainRewardsFormatted = blockchainOffers
    .filter((offer) => offer.isActive) // Only show active offers
    .map((offer) => {
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

      // Check if offer is available
      const now = Date.now() / 1000;
      const isExpired = offer.expiration && offer.expiration.toNumber() < now;
      const isSoldOut = offer.quantityLimit && offer.quantityClaimed >= offer.quantityLimit;
      const available = !isExpired && !isSoldOut;

      // Use stored icon or fallback to type-based icon
      const iconElement = offer.icon ? (
        <IconRenderer icon={offer.icon} className="w-8 h-8" />
      ) : (
        getOfferIcon(offer.offerType)
      );

      return {
        id: offer.publicKey.toString(),
        type,
        icon: iconElement,
        merchant: merchantNames[offer.merchant.toString()] || "Loading...",
        name: offer.name,
        description: offer.description,
        cost: offer.cost.toNumber(),
        available,
        isMock: false,
        publicKey: offer.publicKey.toString(),
      };
    });

  // Combine blockchain and mock rewards
  const allRewards = [...blockchainRewardsFormatted, ...mockRewards];

  const history = [
    {
      id: "history-1",
      reward: "Premium Espresso Bag",
      merchant: "Solana Coffee",
      amount: "-450 SLCY",
      date: "Oct 24, 2024",
      status: "completed",
    },
    {
      id: "history-2",
      reward: "Monthly Gym Pass",
      merchant: "Elite Fitness",
      amount: "-2,500 SLCY",
      date: "Oct 18, 2024",
      status: "completed",
    },
    {
      id: "history-3",
      reward: "Digital Sticker Pack",
      merchant: "Solana Creative",
      amount: "-100 SLCY",
      date: "Oct 12, 2024",
      status: "pending",
    },
  ];

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
              12,450.75 <span className="text-sm text-text-secondary">SLCY</span>
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
                <div className="grid grid-cols-4 gap-8">
                  {allRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-panel border border-border rounded-xl p-6 flex flex-col transition-all duration-200 hover:border-[#333] relative"
                    >
                      {reward.isMock && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[0.6rem] uppercase font-bold px-2 py-1 rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                            Demo
                          </span>
                        </div>
                      )}
                      <span
                        className={`text-[0.65rem] uppercase font-bold px-2 py-1 rounded w-fit mb-4 ${reward.type === "discount"
                          ? "bg-[rgba(208,255,20,0.1)] text-accent"
                          : reward.type === "product"
                            ? "bg-[rgba(0,150,255,0.1)] text-[#0096ff]"
                            : reward.type === "cashback"
                              ? "bg-[rgba(0,255,128,0.1)] text-[#00ff80]"
                              : "bg-[rgba(163,53,255,0.1)] text-[#a335ff]"
                          }`}
                      >
                        {reward.type === "discount"
                          ? "Discount %"
                          : reward.type === "product"
                            ? "Free Product"
                            : reward.type === "cashback"
                              ? "SOL Cashback"
                              : "Exclusive Access"}
                      </span>
                      <div className="text-[2rem] mb-4">{reward.icon}</div>
                      <div className="text-[0.75rem] text-text-secondary uppercase tracking-wider mb-3">
                        {reward.merchant}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{reward.name}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-6 grow">
                        {reward.description}
                      </p>
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className="text-xl font-bold">{reward.cost}</span>
                        <span className="text-xs text-text-secondary">SLCY</span>
                      </div>
                      {reward.available ? (
                        <button
                          type="button"
                          onClick={() => openRedeemModal(reward.name, reward.cost, reward.publicKey || "")}
                          className="w-full py-3.5 rounded-md border border-accent bg-transparent text-accent font-semibold text-sm transition-all duration-200 hover:bg-accent hover:text-bg"
                        >
                          Redeem
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3.5 rounded-md border border-border bg-[#1a1a1a] text-[#444] font-semibold text-sm cursor-not-allowed"
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "history" && (
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
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
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
                        className={`px-2 py-1 rounded text-[0.7rem] font-semibold uppercase ${item.status === "completed"
                          ? "bg-[rgba(0,255,128,0.1)] text-[#00ff80]"
                          : "bg-[rgba(255,165,0,0.1)] text-[#ffa500]"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-1000">
            <div className="bg-panel border border-border w-[440px] rounded-2xl p-10 relative">
              {modalView === "confirm" && (
                <div>
                  <h3 className="text-xl font-bold mb-6 text-center">
                    Confirm Redemption
                  </h3>
                  <div className="bg-bg rounded-lg p-6 mb-8 flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Reward</span>
                      <span className="font-medium">{selectedReward.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Cost</span>
                      <span className="font-medium text-accent">
                        {selectedReward.cost} SLCY
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Network Fee</span>
                      <span className="font-medium">0.000005 SOL</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-transparent border border-border text-text-secondary cursor-pointer h-12 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmRedeem}
                      className="flex-2 bg-accent border-none text-bg font-bold cursor-pointer h-12 rounded"
                    >
                      Confirm & Pay
                    </button>
                  </div>
                </div>
              )}

              {modalView === "success" && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[rgba(208,255,20,0.1)] rounded-full flex items-center justify-center mx-auto mb-6 text-accent text-[2rem]">
                    ✓
                  </div>
                  <h3 className="mb-2 text-xl font-bold">
                    Redemption Successful!
                  </h3>
                  <p className="text-text-secondary text-sm mb-8">
                    Your reward code has been sent to your wallet and email.
                  </p>
                  <div className="bg-bg rounded-lg p-6 text-left mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Signature</span>
                      <span className="font-medium font-mono">4k8L...9zPr</span>
                    </div>
                  </div>
                  <a
                    href="https://explorer.solana.com"
                    className="text-accent no-underline text-sm block mb-8"
                  >
                    View on Solana Explorer ↗
                  </a>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full bg-accent border-none text-bg font-bold cursor-pointer h-12 rounded"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
