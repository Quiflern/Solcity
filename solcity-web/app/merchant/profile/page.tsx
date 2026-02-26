"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { AlertTriangle, ChevronRight, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import Toggle from "@/components/ui/Toggle";
import { useMerchantAccount } from "@/hooks/merchant/useMerchantAccount";
import { useMerchantClose } from "@/hooks/merchant/useMerchantClose";
import { useMerchantRewardRules } from "@/hooks/merchant/useMerchantRewardRules";
import { useMerchantUpdate } from "@/hooks/merchant/useMerchantUpdate";
import { getLoyaltyProgramPDA, getMerchantPDA } from "@/lib/anchor/pdas";

/**
 * Merchant Profile Management Page
 *
 * Interface for viewing and updating merchant account settings.
 *
 * Features:
 * - View current merchant information:
 *   - Business name (immutable)
 *   - Avatar, description, category
 *   - Reward rate and account status
 *   - Creation date and on-chain addresses
 *
 * - Update merchant settings:
 *   - Avatar URL/code
 *   - Business description
 *   - Category
 *   - Reward rate (SLCY per dollar)
 *   - Active/inactive status
 *
 * - Account management:
 *   - Close merchant account (requires no active rules)
 *   - Reclaim SOL rent from closed account
 *
 * Changes are submitted to the blockchain and update the on-chain merchant account.
 *
 * @returns Merchant profile editor with update and close account functionality
 */
export default function MerchantProfilePage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { merchantAccount, isLoading, refetch } = useMerchantAccount();
  const { updateMerchant, isUpdating } = useMerchantUpdate();
  const { closeMerchant, isClosing } = useMerchantClose();

  // Fetch reward rules to check if any exist
  const merchantPDA =
    publicKey && merchantAccount
      ? getMerchantPDA(publicKey, getLoyaltyProgramPDA(publicKey)[0])[0]
      : null;
  const { data: rules = [] } = useMerchantRewardRules(merchantPDA);

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState("");
  const [rewardRate, setRewardRate] = useState(1.0);
  const [isActive, setIsActive] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Initialize form when merchant account loads
  useEffect(() => {
    if (merchantAccount) {
      setBusinessName(merchantAccount.name);
      setDescription(merchantAccount.description || "");
      setAvatarUrl(merchantAccount.avatarUrl || "");
      setCategory(merchantAccount.category || "Other");
      setRewardRate(merchantAccount.rewardRate / 100);
      setIsActive(merchantAccount.isActive);
    }
  }, [merchantAccount]);

  const getAvatarUrl = (avatarCode: string, businessName: string) => {
    if (!avatarCode) {
      return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(businessName)}&backgroundColor=d0ff14`;
    }
    if (avatarCode.startsWith("http://") || avatarCode.startsWith("https://")) {
      return avatarCode;
    }
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarCode)}&backgroundColor=d0ff14`;
  };

  const displayAvatarUrl = avatarUrl
    ? getAvatarUrl(avatarUrl, businessName)
    : getAvatarUrl(businessName || "Business", businessName);

  const handleSave = async () => {
    if (!merchantAccount) return;

    // Validation
    if (description && description.length > 256) {
      toast.error("Description too long", {
        description: "Description must be 256 characters or less",
      });
      return;
    }

    if (avatarUrl && avatarUrl.length > 256) {
      toast.error("Avatar URL too long", {
        description: "Avatar URL must be 256 characters or less",
      });
      return;
    }

    if (category && category.length > 32) {
      toast.error("Category too long", {
        description: "Category must be 32 characters or less",
      });
      return;
    }

    const loadingToast = toast.loading("Updating merchant profile...");

    try {
      const updates: Record<string, string | number | boolean> = {};

      // Only include changed fields
      if (description !== (merchantAccount.description || "")) {
        updates.description = description;
      }
      if (avatarUrl !== (merchantAccount.avatarUrl || "")) {
        updates.avatarUrl = avatarUrl;
      }
      if (category !== (merchantAccount.category || "Other")) {
        updates.category = category;
      }
      if (rewardRate !== merchantAccount.rewardRate / 100) {
        updates.rewardRate = Math.floor(rewardRate * 100);
      }
      if (isActive !== merchantAccount.isActive) {
        updates.isActive = isActive;
      }

      if (Object.keys(updates).length === 0) {
        toast.dismiss(loadingToast);
        toast.info("No changes to save", { duration: 3000 });
        return;
      }

      await updateMerchant(updates);

      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully!", { duration: 3000 });

      // Refetch merchant account
      setTimeout(() => refetch(), 1000);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toast.error("Failed to update profile", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleCloseAccount = async () => {
    const loadingToast = toast.loading("Closing merchant account...");

    try {
      await closeMerchant();

      toast.dismiss(loadingToast);
      toast.success("Account closed successfully!", {
        description: "Your merchant account has been closed and rent refunded",
        duration: 4000,
      });

      setShowCloseModal(false);

      // Redirect to register page after a short delay
      setTimeout(() => {
        router.push("/merchant/register");
      }, 2000);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toast.error("Failed to close account", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!merchantAccount) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl mb-2">No Merchant Account Found</h2>
            <p className="text-text-secondary mb-6">
              You need to register as a merchant before you can access this
              page.
            </p>
            <Link
              href="/merchant/register"
              className="inline-block bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Register as Merchant
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg">
        <div className="max-w-[1000px] mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-2">Merchant Profile</h1>
            <p className="text-text-secondary">
              Update your business information and manage your account
            </p>
          </div>

          {/* Profile Form */}
          <div className="bg-panel border border-border rounded-xl p-8 mb-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="w-24 h-24 bg-black border border-border rounded-xl overflow-hidden">
                {/* biome-ignore lint/performance/noImgElement: Avatar from external source */}
                <img
                  src={displayAvatarUrl}
                  alt={businessName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (
                      target.src !== getAvatarUrl(businessName, businessName)
                    ) {
                      target.src = getAvatarUrl(businessName, businessName);
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {merchantAccount.name}
                </h2>
                <p className="text-sm text-text-secondary">
                  Registered on{" "}
                  {new Date(
                    merchantAccount.createdAt * 1000,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label
                  htmlFor="business-name-disabled"
                  className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                >
                  Business Name (Cannot be changed)
                </label>
                <input
                  id="business-name-disabled"
                  type="text"
                  value={businessName}
                  disabled
                  className="w-full bg-black border border-border text-text-secondary px-4 py-3 rounded-lg text-sm cursor-not-allowed opacity-60"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="avatar-url-input"
                  className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                >
                  Avatar Code or URL
                </label>
                <input
                  id="avatar-url-input"
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                  placeholder="e.g., robot-blue or https://example.com/logo.png"
                  maxLength={256}
                />
                {avatarUrl && (
                  <p className="text-xs text-text-secondary mt-2">
                    {avatarUrl.length}/256 characters
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="description-textarea"
                  className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                >
                  Business Description
                </label>
                <textarea
                  id="description-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent resize-none"
                  placeholder="Tell customers about your business..."
                  rows={4}
                  maxLength={256}
                />
                <p className="text-xs text-text-secondary mt-2">
                  {description.length}/256 characters
                </p>
              </div>

              <div>
                <Dropdown
                  label="Category"
                  options={[
                    { value: "Food & Beverage", label: "Food & Beverage" },
                    { value: "Retail", label: "Retail" },
                    { value: "Services", label: "Services" },
                    { value: "Entertainment", label: "Entertainment" },
                    { value: "Health & Fitness", label: "Health & Fitness" },
                    { value: "Travel", label: "Travel" },
                    { value: "Technology", label: "Technology" },
                    { value: "Other", label: "Other" },
                  ]}
                  value={category}
                  onChange={setCategory}
                  placeholder="Select category"
                />
              </div>

              <div>
                <label
                  htmlFor="reward-rate-input"
                  className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                >
                  Reward Rate
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="reward-rate-input"
                    type="number"
                    value={rewardRate}
                    onChange={(e) =>
                      setRewardRate(parseFloat(e.target.value) || 0)
                    }
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="flex-1 bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                  />
                  <span className="text-text-secondary text-sm">SLCY / $</span>
                </div>
              </div>

              <div className="col-span-2">
                <Toggle
                  label="Account Active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  description="When inactive, customers cannot earn or redeem rewards"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 bg-accent text-black px-6 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowCloseModal(true)}
              className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-lg font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Close Account
            </button>
          </div>

          {/* Account Info */}
          <div className="bg-panel border border-border rounded-xl p-6 mt-6">
            <h3 className="text-sm font-semibold uppercase text-text-secondary mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-secondary mb-1">Authority</p>
                <p className="font-mono text-xs break-all">
                  {merchantAccount.authority.toString()}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Loyalty Program</p>
                <p className="font-mono text-xs break-all">
                  {merchantAccount.loyaltyProgram.toString()}
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Total Issued</p>
                <p className="text-accent">
                  {merchantAccount.totalIssued.toLocaleString()} SLCY
                </p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Total Redeemed</p>
                <p className="text-accent">
                  {merchantAccount.totalRedeemed.toLocaleString()} SLCY
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Account Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Merchant Account"
      >
        <div className="space-y-4">
          {rules.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-500 font-semibold mb-1">
                    You have {rules.length} active reward rule
                    {rules.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-text-secondary mb-3">
                    Please delete all reward rules before closing your account
                    to reclaim the rent.
                  </p>
                  <Link
                    href="/merchant/rules"
                    className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                  >
                    Go to Rules Page <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-500 font-semibold mb-1">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-text-secondary">
                  Closing your merchant account will permanently delete all your
                  data and you will not be able to recover it.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-text-secondary">
            <p>Before closing your account, please note:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Delete all reward rules first to reclaim rent</li>
              <li>
                Customers will no longer be able to earn or redeem rewards
              </li>
              <li>Your merchant account rent (~0.04 SOL) will be refunded</li>
              <li>This action is permanent and cannot be reversed</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCloseModal(false)}
              className="flex-1 bg-panel border border-border text-text px-4 py-3 rounded-lg font-semibold hover:border-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCloseAccount}
              disabled={isClosing || rules.length > 0}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClosing
                ? "Closing Account..."
                : rules.length > 0
                  ? "Delete Rules First"
                  : "Close Account"}
            </button>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  );
}
