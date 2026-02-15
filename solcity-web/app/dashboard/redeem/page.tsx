"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

export default function RedeemPage() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "history">(
    "marketplace",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"confirm" | "success">("confirm");
  const [selectedReward, setSelectedReward] = useState({ name: "", cost: 0 });

  const openRedeemModal = (name: string, cost: number) => {
    setSelectedReward({ name, cost });
    setModalView("confirm");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const confirmRedeem = () => {
    setModalView("success");
  };

  const rewards = [
    {
      id: "reward-1",
      type: "discount",
      icon: "☕",
      merchant: "Solana Coffee",
      name: "50% Off Any Beverage",
      description:
        "Valid for one large handcrafted drink. Available at all locations.",
      cost: 250,
      available: true,
    },
    {
      id: "reward-2",
      type: "product",
      icon: "🧢",
      merchant: "Solana Store",
      name: "Limited Edition Hat",
      description:
        "Exclusive 'WAGMI' trucker hat from the Fall '24 collection.",
      cost: 1200,
      available: true,
    },
    {
      id: "reward-3",
      type: "cashback",
      icon: "◎",
      merchant: "Network Bridge",
      name: "Convert 1.0 SOL",
      description:
        "Direct swap of your reward tokens for SOL sent to your wallet.",
      cost: 15000,
      available: false,
    },
    {
      id: "reward-4",
      type: "exclusive",
      icon: "🎟️",
      merchant: "Breakpoint '25",
      name: "VIP Pass Entry",
      description:
        "Pre-sale priority access code for the annual developer conference.",
      cost: 5000,
      available: true,
    },
    {
      id: "reward-5",
      type: "discount",
      icon: "🍔",
      merchant: "Block Burger",
      name: "$10 Dining Credit",
      description: "Applied to any dine-in or take-out order over $20.",
      cost: 800,
      available: true,
    },
  ];

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
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar variant="connected" walletAddress="8xY2...pL9n" />

      {/* Page Header */}
      <div className="px-12 py-10 pb-6 flex justify-between items-end bg-linear-to-b from-[#050505] to-bg">
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
      <div className="px-10 border-b border-border flex gap-10">
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
      <div className="h-[calc(900px-72px-140px-50px)] overflow-y-auto p-10">
        {activeTab === "marketplace" && (
          <div className="grid grid-cols-4 gap-6">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-panel border border-border rounded-xl p-6 flex flex-col transition-all duration-200 hover:border-[#333]"
              >
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
                    onClick={() => openRedeemModal(reward.name, reward.cost)}
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
                    Not Enough SLCY
                  </button>
                )}
              </div>
            ))}
          </div>
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

      <Footer />
    </div>
  );
}
