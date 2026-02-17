"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import Toggle from "@/components/ui/Toggle";
import { useState } from "react";
import { useRewardRules, type RuleType } from "@/hooks/useRewardRules";
import { useMerchantAccount } from "@/hooks/useMerchantAccount";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

export default function MerchantRulesPage() {
  const { publicKey } = useWallet();
  const { createRewardRule, isLoading } = useRewardRules();
  const { merchantAccount, isLoading: merchantLoading } = useMerchantAccount();

  const [createdRules, setCreatedRules] = useState<Array<{
    id: number;
    type: string;
    multiplier: number;
    minPurchase: number;
    startTime: number;
    endTime: number;
    isActive: boolean;
  }>>([]);

  const [ruleType, setRuleType] = useState("bonusMultiplier");
  const [multiplier, setMultiplier] = useState("200");
  const [minPurchase, setMinPurchase] = useState("10.00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ruleTypeOptions = [
    { value: "bonusMultiplier", label: "Bonus Multiplier" },
    { value: "baseReward", label: "Base Reward" },
    { value: "firstPurchaseBonus", label: "First Purchase Bonus" },
    { value: "referralBonus", label: "Referral Bonus" },
    { value: "tierBonus", label: "Tier Bonus" },
    { value: "streakBonus", label: "Streak Bonus" },
  ];

  const multiplierOptions = [
    { value: "100", label: "1.0x" },
    { value: "150", label: "1.5x" },
    { value: "200", label: "2.0x" },
    { value: "300", label: "3.0x" },
    { value: "500", label: "5.0x" },
  ];

  const resetForm = () => {
    setRuleType("bonusMultiplier");
    setMultiplier("200");
    setMinPurchase("10.00");
    setStartDate("");
    setEndDate("");
  };

  const handleSaveRule = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!merchantAccount) {
      toast.error("Please register as a merchant first", {
        description: "Go to Merchant Dashboard to register",
      });
      return;
    }

    // Validation
    if (!minPurchase || parseFloat(minPurchase) < 0) {
      toast.error("Please enter a valid minimum purchase amount");
      return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      // Convert rule type string to enum object
      const ruleTypeEnum: RuleType = { [ruleType]: {} } as RuleType;

      // Convert min purchase from dollars to cents
      const minPurchaseCents = Math.round(parseFloat(minPurchase) * 100);

      // Convert dates to Unix timestamps
      const startTime = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
      const endTime = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;

      // Generate a unique rule ID
      const ruleId = Date.now();

      const result = await createRewardRule({
        ruleId,
        ruleType: ruleTypeEnum,
        multiplier: parseInt(multiplier),
        minPurchase: minPurchaseCents,
        startTime,
        endTime,
      });

      toast.success("Reward rule created successfully!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`,
      });

      // Add to created rules list
      setCreatedRules((prev) => [
        ...prev,
        {
          id: ruleId,
          type: ruleType,
          multiplier: parseInt(multiplier),
          minPurchase: minPurchaseCents,
          startTime,
          endTime,
          isActive: true,
        },
      ]);

      // Reset form
      resetForm();
    } catch (err: any) {
      toast.error("Failed to create reward rule", {
        description: err.message || "Unknown error occurred",
      });
    }
  };

  const toggleRuleActive = (ruleId: number) => {
    // Note: This is UI-only. To persist on-chain, you'd need to add an
    // update_reward_rule instruction to the smart contract
    setCreatedRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );

    toast.info("Toggle is UI-only", {
      description: "On-chain update requires adding update_reward_rule instruction",
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "bonusMultiplier":
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "baseReward":
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.646 1M12 8V7m0 11v-1m0-5V7m0 11c-1.11 0-2.08-.407-2.646-1" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "tierBonus":
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "No expiry";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />

        <div className="max-w-[1400px] mx-auto px-8 w-full py-12">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Reward Rules</h1>
              <p className="text-text-secondary text-sm mt-1">
                Configure how your customers earn SLCY tokens.
              </p>
            </div>
            {!merchantAccount && !merchantLoading && (
              <div className="text-sm text-text-secondary">
                Register as merchant to create rules
              </div>
            )}
          </div>

          {/* Dashboard Layout */}
          <div className="grid grid-cols-[1fr_450px] gap-10">
            {/* Main Content - Rules List */}
            <div className="flex flex-col gap-4">
              {createdRules.length === 0 ? (
                <Card className="py-12 px-6 text-center cursor-default">
                  <div className="text-text-secondary">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No rules created yet</h3>
                    <p className="text-sm">
                      Create your first reward rule using the builder on the right
                    </p>
                  </div>
                </Card>
              ) : (
                createdRules.map((rule) => (
                  <Card
                    key={rule.id}
                    className="py-5 px-6 flex items-center justify-between cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-accent">
                        {getRuleIcon(rule.type)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-1">
                          {ruleTypeOptions.find((opt) => opt.value === rule.type)?.label}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {(rule.multiplier / 100).toFixed(1)}x multiplier • Min ${(rule.minPurchase / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="block text-sm font-medium">
                          {rule.startTime === 0 ? "Active Now" : formatDate(rule.startTime)}
                        </span>
                        <span className="text-[0.7rem] text-text-secondary">
                          {rule.endTime === 0 ? "No Expiry" : `Until ${formatDate(rule.endTime)}`}
                        </span>
                      </div>
                      <Toggle
                        checked={rule.isActive}
                        onChange={() => toggleRuleActive(rule.id)}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Sidebar - Rule Builder */}
            <aside>
              <Card className="p-8 sticky top-[92px] cursor-default">
                <h3 className="text-[0.75rem] uppercase text-text-secondary mb-6 tracking-wider flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    fill="var(--accent)"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Edit"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Rule Builder
                </h3>

                <div className="mb-5">
                  <Dropdown
                    label="Rule Type"
                    options={ruleTypeOptions}
                    value={ruleType}
                    onChange={setRuleType}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="mb-5">
                    <Dropdown
                      label="Multiplier"
                      options={multiplierOptions}
                      value={multiplier}
                      onChange={setMultiplier}
                    />
                  </div>
                  <div className="mb-5">
                    <Input
                      label="Min. Purchase ($)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="mb-5">
                    <Input
                      label="Start Date (Opt.)"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="mb-5">
                    <Input
                      label="End Date (Opt.)"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stacking Preview */}
                <div className="bg-black border border-dashed border-border rounded-lg p-5 mt-6">
                  <h5 className="text-[0.7rem] uppercase text-text-secondary mb-4">
                    Stacking Preview (Sample $100 Purchase)
                  </h5>

                  <div className="flex justify-between text-xs text-text mb-2.5">
                    <span>Base Rate (1.0x)</span>
                    <span>100.00 SLCY</span>
                  </div>
                  <div className="flex justify-between text-xs text-text mb-2.5">
                    <span>
                      {ruleTypeOptions.find((opt) => opt.value === ruleType)?.label} (
                      {(parseInt(multiplier) / 100).toFixed(1)}x)
                    </span>
                    <span>+{((parseInt(multiplier) / 100 - 1) * 100).toFixed(2)} SLCY</span>
                  </div>

                  <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-border">
                    <span>Total Reward</span>
                    <span className="text-accent">
                      {((parseInt(multiplier) / 100) * 100).toFixed(2)} SLCY
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-4"
                  onClick={handleSaveRule}
                  isLoading={isLoading}
                  disabled={!publicKey || !merchantAccount}
                >
                  {!publicKey ? "Connect Wallet" : !merchantAccount ? "Register First" : "Create Rule"}
                </Button>

                {createdRules.length > 0 && (
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full mt-2.5"
                    onClick={resetForm}
                  >
                    Reset Form
                  </Button>
                )}
              </Card>
            </aside>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
