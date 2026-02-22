"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dropdown from "@/components/ui/Dropdown";
import { useState } from "react";
import { useMerchantRegister } from "@/hooks/useMerchantRegister";
import { useMerchantAccount } from "@/hooks/useMerchantAccount";
import { useLoyaltyProgram } from "@/hooks/useLoyaltyProgram";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import Link from "next/link";

export default function MerchantRegisterPage() {
  const { publicKey } = useWallet();
  const { registerComplete, isLoading, error } = useMerchantRegister();
  const { isRegistered, merchantAccount, isLoading: checkingMerchant, refetch } = useMerchantAccount();
  const { loyaltyProgram } = useLoyaltyProgram();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState("Food & Beverage");
  const [email, setEmail] = useState("");
  const [rewardRate, setRewardRate] = useState(1.0);
  const [interestRate, setInterestRate] = useState(500);
  const [programName, setProgramName] = useState("");
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const apyPercent = (interestRate / 100).toFixed(2);

  // Generate random avatar code
  const generateRandomAvatar = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const randomSeed = `avatar-${timestamp}-${random}`;
    setAvatarUrl(randomSeed);
    toast.success("Random avatar generated!");
  };

  // Generate avatar URL from code or custom URL
  const getAvatarUrl = (avatarCode: string) => {
    // If it's a full URL, use it directly
    if (avatarCode.startsWith('http://') || avatarCode.startsWith('https://')) {
      return avatarCode;
    }
    // Otherwise, generate DiceBear Bottts Neutral avatar
    return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(avatarCode)}&backgroundColor=d0ff14`;
  };

  // Generate default avatar code if not provided
  const displayAvatarUrl = avatarUrl
    ? getAvatarUrl(avatarUrl)
    : getAvatarUrl(businessName || "Business");

  const handleDeploy = async () => {
    if (!publicKey) {
      toast.error("Wallet not connected", {
        description: "Please connect your Solana wallet to continue"
      });
      return;
    }

    if (!businessName.trim()) {
      toast.error("Business name required", {
        description: "Please enter your business name"
      });
      return;
    }

    if (businessName.length > 32) {
      toast.error("Business name too long", {
        description: "Business name must be 32 characters or less"
      });
      return;
    }

    if (avatarUrl && avatarUrl.length > 256) {
      toast.error("Avatar URL too long", {
        description: "Avatar URL must be 256 characters or less. Consider using a URL shortener or an avatar code instead."
      });
      return;
    }

    if (category.length > 32) {
      toast.error("Category too long", {
        description: "Category must be 32 characters or less"
      });
      return;
    }

    if (description && description.length > 256) {
      toast.error("Description too long", {
        description: "Description must be 256 characters or less"
      });
      return;
    }

    if (!programName.trim()) {
      toast.error("Program name required", {
        description: "Please enter a loyalty program name"
      });
      return;
    }

    const loadingToast = toast.loading("Deploying loyalty program...");

    try {
      // Convert reward rate to basis points (1.0 = 100)
      const rewardRateBps = Math.floor(rewardRate * 100);

      const result = await registerComplete(
        programName,
        businessName,
        avatarUrl || displayAvatarUrl, // Use provided URL or generated one
        category,
        description,
        rewardRateBps,
        interestRate
      );

      toast.dismiss(loadingToast);
      toast.success("Loyalty program deployed successfully!", {
        description: "Your on-chain loyalty program is now live"
      });
      setSuccess(true);
      setTxSignature(result.signature);

      // Refetch merchant account to update UI
      setTimeout(() => refetch(), 1000);
    } catch (err: any) {
      toast.dismiss(loadingToast);

      // Parse error message for better user feedback
      let errorTitle = "Failed to deploy loyalty program";
      let errorDescription = err.message || "Unknown error occurred";

      if (err.message?.includes("Attempt to debit an account but found no record of a prior credit")) {
        errorTitle = "Insufficient balance";
        errorDescription = "Your wallet doesn't have enough SOL. Please add funds to continue.";
      } else if (err.message?.includes("already in use")) {
        errorTitle = "Account already exists";
        errorDescription = "This merchant account is already registered. Try using a different wallet.";
      } else if (err.message?.includes("Transaction simulation failed")) {
        errorTitle = "Transaction failed";
        errorDescription = "The transaction could not be processed. Please try again.";
      } else if (err.message?.includes("User rejected")) {
        errorTitle = "Transaction cancelled";
        errorDescription = "You cancelled the transaction in your wallet.";
      }

      toast.error(errorTitle, {
        description: errorDescription
      });
    }
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
                  <p className="text-xs text-text-secondary">Please connect your Solana wallet to register your business</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setup Container */}
        <div className="max-w-[1400px] mx-auto px-8 w-full py-12">
          {/* Show merchant info if already registered */}
          {isRegistered && merchantAccount ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl mb-2">Your Business Profile</h2>
                <p className="text-text-secondary text-sm">
                  Your loyalty program is active on Solana blockchain.
                </p>
              </div>

              <div className="bg-panel border border-border rounded-xl p-8 mb-6">
                <div className="flex items-start gap-6 mb-8">
                  <img
                    src={merchantAccount.avatarUrl ?
                      (merchantAccount.avatarUrl.startsWith('http') ?
                        merchantAccount.avatarUrl :
                        `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(merchantAccount.avatarUrl)}&backgroundColor=d0ff14`
                      ) :
                      `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(merchantAccount.name)}&backgroundColor=d0ff14`
                    }
                    alt={merchantAccount.name}
                    className="w-24 h-24 rounded-xl object-cover border border-border"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{merchantAccount.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>Verified Merchant</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-black border border-border rounded-lg p-4">
                        <p className="text-xs text-text-secondary uppercase mb-1">Reward Rate</p>
                        <p className="text-lg font-bold text-accent">{(merchantAccount.rewardRate / 100).toFixed(1)} SLCY / $</p>
                      </div>
                      <div className="bg-black border border-border rounded-lg p-4">
                        <p className="text-xs text-text-secondary uppercase mb-1">Total Issued</p>
                        <p className="text-lg font-bold">{(merchantAccount.totalIssued / 1e9).toFixed(2)} SLCY</p>
                      </div>
                      <div className="bg-black border border-border rounded-lg p-4">
                        <p className="text-xs text-text-secondary uppercase mb-1">Total Redeemed</p>
                        <p className="text-lg font-bold">{(merchantAccount.totalRedeemed / 1e9).toFixed(2)} SLCY</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold uppercase text-text-secondary">Account Details</h4>
                    <span className={`text-xs px-3 py-1 rounded-full ${merchantAccount.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {merchantAccount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary mb-1">Authority</p>
                      <p className="font-mono text-xs">{merchantAccount.authority.toString().slice(0, 8)}...{merchantAccount.authority.toString().slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary mb-1">Loyalty Program</p>
                      <p className="font-mono text-xs">{merchantAccount.loyaltyProgram.toString().slice(0, 8)}...{merchantAccount.loyaltyProgram.toString().slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary mb-1">Created At</p>
                      <p>{new Date(merchantAccount.createdAt * 1000).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary mb-1">Avatar</p>
                      <p className="text-xs">{merchantAccount.avatarUrl || 'Auto-generated'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/merchant"
                  className="flex-1 bg-accent text-black px-6 py-4 rounded-lg font-semibold text-center hover:bg-accent/90 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/merchant/rules"
                  className="flex-1 bg-panel border border-border text-text px-6 py-4 rounded-lg font-semibold text-center hover:border-accent transition-colors"
                >
                  Manage Reward Rules
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-12">
              {/* Left Column - Form Steps */}
              <div className="flex flex-col gap-10">
                {/* Section Header */}
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Register Your Business</h2>
                  <p className="text-text-secondary text-sm">
                    Initialize your on-chain merchant identity on Solana.
                  </p>
                </div>

                {/* Business Info Form */}
                <div className="bg-panel border border-border p-8 rounded-xl mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label
                        htmlFor="business-name"
                        className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                      >
                        Business Name
                      </label>
                      <input
                        id="business-name"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                        placeholder="e.g. Blue Bottle Coffee"
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="avatar-url"
                        className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                      >
                        Avatar Code or URL (Optional)
                      </label>
                      <div className="flex gap-3">
                        <input
                          id="avatar-url"
                          type="text"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="flex-1 bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                          placeholder="e.g., robot-blue or https://example.com/logo.png"
                          maxLength={256}
                        />
                        <button
                          type="button"
                          onClick={generateRandomAvatar}
                          className="bg-panel border border-border text-text px-4 py-3 rounded-lg text-sm hover:border-accent transition-colors whitespace-nowrap"
                        >
                          Generate Random
                        </button>
                      </div>
                      <div className="flex items-start gap-3 mt-3">
                        <div className="flex-1">
                          <p className="text-xs text-text-secondary">
                            Enter a code (e.g., "robot-1") for auto-generated avatar, or a direct image URL (must end in .jpg, .png, .gif, etc.)
                          </p>
                          {avatarUrl && (
                            <p className="text-xs text-text-secondary mt-1">
                              {avatarUrl.length}/256 characters {avatarUrl.length > 200 && <span className="text-yellow-500">(getting long)</span>}
                            </p>
                          )}
                        </div>
                        {(avatarUrl || businessName) && (
                          <div className="flex items-center gap-2 bg-black border border-border rounded-lg p-2">
                            <span className="text-xs text-text-secondary">Preview:</span>
                            <img
                              src={displayAvatarUrl}
                              alt="Avatar preview"
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                // Fallback to generated avatar if URL fails to load
                                const target = e.target as HTMLImageElement;
                                if (target.src !== getAvatarUrl(businessName || "Business")) {
                                  target.src = getAvatarUrl(businessName || "Business");
                                  toast.error("Invalid image URL", {
                                    description: "Using auto-generated avatar instead. Please provide a direct image URL (ending in .jpg, .png, etc.)"
                                  });
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="description"
                        className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                      >
                        Business Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent resize-none"
                        placeholder="Tell customers about your business..."
                        rows={3}
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
                        htmlFor="email"
                        className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                      >
                        Contact Email (Optional)
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                        placeholder="admin@business.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Loyalty Program Config */}
                <div className="mb-8">
                  <h2 className="text-2xl mb-2">Configure Loyalty Program</h2>
                  <p className="text-text-secondary text-sm">
                    Define your token mechanics using Token-2022 Interest-Bearing
                    extensions.
                  </p>
                </div>

                <div className="bg-panel border border-border p-8 rounded-xl mb-8">
                  <div className="mb-6">
                    <label
                      htmlFor="reward-rate"
                      className="flex items-center justify-between text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                    >
                      <span>Reward Rate</span>
                      <span className="text-accent">
                        {rewardRate.toFixed(1)} SLCY / $1
                      </span>
                    </label>
                    <input
                      id="reward-rate"
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={rewardRate}
                      onChange={(e) => setRewardRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-border rounded-full outline-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full my-4"
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="interest-rate"
                      className="flex items-center text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                    >
                      <span>Annual Interest Rate (BP)</span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="ml-1"
                        role="img"
                        aria-label="Info"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </label>
                    <input
                      id="interest-rate"
                      type="number"
                      value={interestRate}
                      onChange={(e) =>
                        setInterestRate(parseInt(e.target.value, 10) || 0)
                      }
                      className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                      placeholder="500"
                    />
                    <p className="text-[0.7rem] text-text-secondary mt-2">
                      Tokens will accrue {apyPercent}% APY while held by customers.
                      Paid from your treasury.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label
                        htmlFor="program-name"
                        className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider"
                      >
                        Program Name
                      </label>
                      <input
                        id="program-name"
                        type="text"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        className="w-full bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                        placeholder="e.g. Solcity Loyalty"
                      />
                      <p className="text-[0.7rem] text-text-secondary mt-2">
                        This will be stored on-chain as your loyalty program identifier.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deploy Button */}
                {success ? (
                  <div className="bg-accent/10 border border-accent text-accent px-4 py-5 rounded-lg w-full flex flex-col items-center gap-3">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      role="img"
                      aria-label="Success"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <div className="text-center">
                      <div className="font-bold text-lg mb-2">Loyalty Program Deployed!</div>
                      <div className="text-sm text-text-secondary mb-4">
                        Your on-chain loyalty program is now live
                      </div>
                      {txSignature && (
                        <a
                          href={`https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=http://localhost:8899`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline"
                        >
                          View Transaction ↗
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Fee Information Box */}
                    <div className="bg-panel border border-border rounded-xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-accent/10 p-3 rounded-lg">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            role="img"
                            aria-label="Info"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Platform Fees</h4>
                          <div className="space-y-2 text-sm text-text-secondary">
                            <div className="flex justify-between items-center">
                              <span>Registration Fee:</span>
                              <span className="text-accent font-semibold">0.01 SOL</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Account Rent:</span>
                              <span className="text-text font-semibold">~0.04 SOL</span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                              <span className="font-semibold text-text">Total Required:</span>
                              <span className="text-accent font-bold">~0.05 SOL</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-text-secondary mb-3">
                              <span className="font-semibold text-text">Where fees go:</span> Registration fees are collected by the platform treasury to support development and maintenance.
                              Account rent is required by Solana for on-chain storage and is refundable if you close your account.
                            </p>
                            <div className="bg-black border border-border rounded-lg p-3">
                              <p className="text-[0.65rem] uppercase text-text-secondary mb-1">Platform Treasury</p>
                              {loyaltyProgram?.treasury ? (
                                <>
                                  <p className="font-mono text-xs text-accent break-all">
                                    {loyaltyProgram.treasury.toString()}
                                  </p>
                                  <p className="text-[0.65rem] text-text-secondary mt-2">
                                    💡 This is the wallet that initialized the loyalty program. All fees (0.01 SOL registration + issuance fees) are sent here.
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-text-secondary">
                                  Treasury wallet will be set to whoever initializes the loyalty program (typically the platform deployer).
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeploy}
                      disabled={isLoading || !publicKey}
                      className="bg-accent text-black px-4 py-5 border-none font-bold text-base cursor-pointer rounded-lg w-full transition-transform active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Deploying...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            role="img"
                            aria-label="Deploy"
                          >
                            <path d="M12 2v20M2 12h20" />
                          </svg>
                          Deploy Loyalty Program (0.01 SOL Fee)
                        </>
                      )}
                    </button>
                  </>
                )}
                <p className="text-center text-text-secondary text-xs mb-20">
                  By deploying, you agree to pay the platform registration fee. Additional small fees apply when issuing rewards.
                </p>
              </div>

              {/* Right Column - Preview */}
              <div>
                <div className="sticky top-[120px]">
                  <div className="block text-[0.75rem] uppercase text-text-secondary mb-6 tracking-wider">
                    Customer App Preview
                  </div>
                  <div className="bg-linear-to-br from-[#1a1a1a] to-bg border border-border rounded-[20px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                    <span className="inline-block bg-accent/10 text-accent text-[0.7rem] px-2.5 py-1 rounded font-bold uppercase mb-4">
                      Verified Merchant
                    </span>
                    <div className="flex items-center gap-3 mb-6">
                      {businessName ? (
                        <img
                          src={displayAvatarUrl}
                          alt={businessName}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#222] rounded-xl flex items-center justify-center border border-dashed border-[#444]">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#444"
                            strokeWidth="2"
                            role="img"
                            aria-label="Logo placeholder"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold">{businessName || "Your Business"}</h3>
                        <p className="text-xs text-text-secondary">{category}</p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-5">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[0.7rem] text-text-secondary uppercase">
                            Reward Rate
                          </p>
                          <p className="text-[1.4rem] font-bold text-accent">
                            {rewardRate.toFixed(1)} SLCY / $
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.7rem] text-text-secondary uppercase">
                            Your Balance
                          </p>
                          <p className="text-lg font-semibold">0.00 SLCY</p>
                        </div>
                      </div>

                      <div className="bg-[#222] p-3 rounded-lg flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            role="img"
                            aria-label="Yield"
                          >
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                            <polyline points="17 6 23 6 23 12" />
                          </svg>
                          <span className="text-xs font-semibold">Yield Bearing</span>
                        </div>
                        <span className="text-xs text-accent">{apyPercent}% APY</span>
                      </div>
                    </div>

                    <div className="mt-6 bg-black border border-border rounded-xl p-4 text-center">
                      <p className="text-[0.75rem] text-text-secondary mb-2">
                        Redeem 100 SLCY for
                      </p>
                      <p className="font-semibold">Free Handcrafted Drink</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}
