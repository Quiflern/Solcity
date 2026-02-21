"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import { useState } from "react";
import { useRewardRules, type RuleType } from "@/hooks/useRewardRules";
import { useMerchantAccount } from "@/hooks/useMerchantAccount";
import { useMerchantRewardRules } from "@/hooks/useMerchantRewardRules";
import { getMerchantPDA, getLoyaltyProgramPDA } from "@/lib/anchor/pdas";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

interface Rule {
  id: number;
  name: string;
  type: string;
  multiplier: number;
  minPurchase: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

export default function MerchantRulesPage() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const { createRewardRule, updateRewardRule, toggleRewardRule, deleteRewardRule, isLoading } = useRewardRules();
  const { merchantAccount, isLoading: merchantLoading } = useMerchantAccount();

  // Get merchant PDA to fetch rules
  const merchantPubkey = merchantAccount && publicKey
    ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
    : null;

  // Fetch rules from blockchain
  const { data: fetchedRules = [], isLoading: rulesLoading } = useMerchantRewardRules(merchantPubkey);

  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [ruleName, setRuleName] = useState("");
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
    setRuleName("");
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
      toast.error("Please register as a merchant first");
      return;
    }

    if (!ruleName.trim()) {
      toast.error("Please enter a rule name");
      return;
    }

    if (!minPurchase || parseFloat(minPurchase) < 0) {
      toast.error("Please enter a valid minimum purchase amount");
      return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    const loadingToast = toast.loading("Creating reward rule...");

    try {
      const ruleTypeEnum: RuleType = { [ruleType]: {} } as RuleType;
      const minPurchaseCents = Math.round(parseFloat(minPurchase) * 100);
      const startTime = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
      const endTime = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;
      const ruleId = Date.now();

      const result = await createRewardRule({
        ruleId,
        name: ruleName,
        ruleType: ruleTypeEnum,
        multiplier: parseInt(multiplier),
        minPurchase: minPurchaseCents,
        startTime,
        endTime,
      });

      toast.dismiss(loadingToast);
      toast.success("Reward rule created successfully!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`,
      });

      // Invalidate queries to refetch rules
      queryClient.invalidateQueries({ queryKey: ["merchantRewardRules"] });

      resetForm();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create reward rule", {
        description: err.message || "Unknown error occurred",
      });
    }
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleType(Object.keys(rule.ruleType)[0]);
    setMultiplier(rule.multiplier.toString());
    setMinPurchase((rule.minPurchase / 100).toFixed(2));
    setStartDate(rule.startTime ? new Date(rule.startTime * 1000).toISOString().split('T')[0] : "");
    setEndDate(rule.endTime ? new Date(rule.endTime * 1000).toISOString().split('T')[0] : "");
    setShowEditModal(true);
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    const loadingToast = toast.loading("Updating reward rule...");

    try {
      const ruleTypeEnum: RuleType = { [ruleType]: {} } as RuleType;
      const minPurchaseCents = Math.round(parseFloat(minPurchase) * 100);
      const startTime = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0;
      const endTime = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0;

      const result = await updateRewardRule({
        ruleId: editingRule.ruleId,
        name: ruleName,
        ruleType: ruleTypeEnum,
        multiplier: parseInt(multiplier),
        minPurchase: minPurchaseCents,
        startTime,
        endTime,
      });

      toast.dismiss(loadingToast);
      toast.success("Rule updated successfully!", {
        description: `Transaction: ${result.signature.slice(0, 8)}...`,
      });

      // Invalidate queries to refetch rules
      queryClient.invalidateQueries({ queryKey: ["merchantRewardRules"] });

      setShowEditModal(false);
      setEditingRule(null);
      resetForm();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update rule", {
        description: err.message,
      });
    }
  };

  const handleToggleRule = async (ruleId: number, currentStatus: boolean) => {
    const loadingToast = toast.loading(`${!currentStatus ? "Activating" : "Pausing"} rule...`);

    try {
      // Find the rule to get its actual addresses
      const rule = fetchedRules.find(r => r.ruleId === ruleId);

      await toggleRewardRule(ruleId, !currentStatus);

      toast.dismiss(loadingToast);
      toast.success(`Rule ${!currentStatus ? "activated" : "paused"}`);

      // Invalidate queries to refetch rules
      queryClient.invalidateQueries({ queryKey: ["merchantRewardRules"] });
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.dismiss(loadingToast);
      toast.error("Failed to toggle rule", {
        description: err.message,
      });
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    setDeletingRuleId(ruleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteRule = async () => {
    if (!deletingRuleId) return;

    const loadingToast = toast.loading("Deleting rule...");

    try {
      await deleteRewardRule(deletingRuleId);

      toast.dismiss(loadingToast);
      toast.success("Rule deleted successfully");

      // Invalidate queries to refetch rules
      queryClient.invalidateQueries({ queryKey: ["merchantRewardRules"] });

      setShowDeleteModal(false);
      setDeletingRuleId(null);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete rule", {
        description: err.message,
      });
    }
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

        {/* Wallet Not Connected Banner */}
        {!publicKey && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 py-4">
            <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-yellow-500"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-500">Wallet Not Connected</p>
                  <p className="text-xs text-text-secondary">Please connect your Solana wallet to manage reward rules</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1400px] mx-auto px-8 w-full py-12">
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

          <div className="grid grid-cols-[1fr_450px] gap-10">
            <div className="flex flex-col gap-4">
              {rulesLoading ? (
                <Card className="py-12 px-6 text-center cursor-default">
                  <div className="text-text-secondary">
                    <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm">Loading rules...</p>
                  </div>
                </Card>
              ) : fetchedRules.length === 0 ? (
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
                fetchedRules.map((rule) => (
                  <Card
                    key={rule.publicKey.toString()}
                    className="py-5 px-6 flex items-center justify-between cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-accent">
                        {getRuleIcon(Object.keys(rule.ruleType)[0])}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-1">{rule.name}</h4>
                        <p className="text-xs text-text-secondary">
                          {(rule.multiplier / 100).toFixed(1)}x multiplier • Min ${(rule.minPurchase / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
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
                        onChange={() => handleToggleRule(rule.ruleId, rule.isActive)}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400"
                        onClick={() => handleDeleteRule(rule.ruleId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <aside>
              <Card className="p-8 sticky top-[92px] cursor-default">
                <h3 className="text-[0.75rem] uppercase text-text-secondary mb-6 tracking-wider flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    fill="var(--accent)"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Rule Builder
                </h3>

                <div className="mb-5">
                  <Input
                    label="Rule Name"
                    type="text"
                    placeholder="e.g., Happy Hour Bonus"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    maxLength={32}
                  />
                </div>

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

                <div className="bg-black border border-dashed border-border rounded-lg p-5 mt-6">
                  <h5 className="text-[0.7rem] uppercase text-text-secondary mb-4">
                    Preview (Sample $100 Purchase)
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

                {fetchedRules.length > 0 && (
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

        {/* Edit Modal */}
        {showEditModal && editingRule && (
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingRule(null);
              resetForm();
            }}
            title="Edit Reward Rule"
          >
            <div className="space-y-4">
              <Input
                label="Rule Name"
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                maxLength={32}
              />

              <Dropdown
                label="Rule Type"
                options={ruleTypeOptions}
                value={ruleType}
                onChange={setRuleType}
              />

              <div className="grid grid-cols-2 gap-4">
                <Dropdown
                  label="Multiplier"
                  options={multiplierOptions}
                  value={multiplier}
                  onChange={setMultiplier}
                />
                <Input
                  label="Min. Purchase ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleUpdateRule}
                  isLoading={isLoading}
                >
                  Update Rule
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingRuleId(null);
          }}
          title="Delete Reward Rule"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Are you sure you want to delete this rule? This action cannot be undone and will permanently remove the rule from the blockchain.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={confirmDeleteRule}
                isLoading={isLoading}
              >
                Delete Rule
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingRuleId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </ProtectedRoute>
  );
}
