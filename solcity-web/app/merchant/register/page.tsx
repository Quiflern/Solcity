"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dropdown from "@/components/ui/Dropdown";
import { useState } from "react";
import { useMerchantRegister } from "@/hooks/useMerchantRegister";
import { useMerchantAccount } from "@/hooks/useMerchantAccount";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMigrateMerchant } from "@/hooks/useMigrateMerchant";
import { toast } from "sonner";
import Link from "next/link";

export default function MerchantRegisterPage() {
  const { publicKey } = useWallet();
  const { registerComplete, isLoading, error } = useMerchantRegister();
  const { migrateMerchant, isLoading: isMigrating } = useMigrateMerchant();
  const { isRegistered, merchantAccount, isLoading: checkingMerchant } = useMerchantAccount();

  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState("food");
  const [email, setEmail] = useState("");
  const [rewardRate, setRewardRate] = useState(1.0);
  const [interestRate, setInterestRate] = useState(500);
  const [programName, setProgramName] = useState("");
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const apyPercent = (interestRate / 100).toFixed(2);

  // Generate random avatar code
  const generateRandomAvatar = () => {
    const randomSeed = `avatar-${Math.random().toString(36).substring(2, 9)}`;
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
      toast.error("Please connect your wallet first");
      return;
    }

    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    if (!programName.trim()) {
      toast.error("Please enter a program name");
      return;
    }

    try {
      toast.loading("Deploying loyalty program...");

      // Convert reward rate to basis points (1.0 = 100)
      const rewardRateBps = Math.floor(rewardRate * 100);

      const result = await registerComplete(
        programName,
        businessName,
        avatarUrl || displayAvatarUrl, // Use provided URL or generated one
        rewardRateBps,
        interestRate
      );

      toast.dismiss();
      toast.success("Loyalty program deployed successfully!");
      setSuccess(true);
      setTxSignature(result.signature);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to deploy loyalty program");
    }
  };

  const handleMigrate = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      toast.loading("Migrating merchant account...");

      const result = await migrateMerchant(avatarUrl || displayAvatarUrl);

      toast.dismiss();
      toast.success("Account migrated successfully!");

      // Reload page to fetch updated account
      window.location.reload();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to migrate account");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />

        {/* Setup Container */}
        <div className="max-w-[1400px] mx-auto px-8 w-full py-12 grid grid-cols-[1.2fr_0.8fr] gap-12">
          {/* Left Column - Form Steps */}
          <div className="flex flex-col gap-10">
            {/* Migration Required Message */}
            {isRegistered && merchantAccount?.needsMigration && (
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-6 flex items-start gap-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-yellow-500 flex-shrink-0 mt-1"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                    Account Migration Required
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Your merchant account needs to be migrated to support the new avatar feature.
                    This is a one-time process that will add the avatar_url field to your account.
                  </p>
                  <div className="mb-4">
                    <label className="block text-[0.75rem] uppercase text-text-secondary mb-3 tracking-wider">
                      Avatar Code or URL (Optional)
                    </label>
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="flex-1 bg-black border border-border text-text px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-accent"
                        placeholder="Enter avatar code or URL"
                      />
                      <button
                        type="button"
                        onClick={generateRandomAvatar}
                        className="bg-panel border border-border text-text px-4 py-3 rounded-lg text-sm hover:border-accent transition-colors whitespace-nowrap"
                      >
                        Generate Random
                      </button>
                    </div>
                    {(avatarUrl || businessName) && (
                      <div className="flex items-center gap-2 bg-black border border-border rounded-lg p-2 mb-2">
                        <span className="text-xs text-text-secondary">Preview:</span>
                        <img
                          src={displayAvatarUrl}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs text-text-secondary">
                      Leave empty to use auto-generated avatar based on business name
                    </p>
                  </div>
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="bg-yellow-500 text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {isMigrating ? "Migrating..." : "Migrate Account"}
                  </button>
                </div>
              </div>
            )}

            {/* Already Registered Message */}
            {isRegistered && merchantAccount && !merchantAccount.needsMigration && (
              <div className="bg-accent/10 border border-accent rounded-xl p-6 flex items-start gap-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent flex-shrink-0 mt-1"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-accent mb-2">
                    Business Already Registered
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Your business "{merchantAccount.name}" is already registered on-chain.
                    You can start issuing rewards from your merchant dashboard.
                  </p>
                  <Link
                    href="/merchant"
                    className="inline-block bg-accent text-black px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}

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
                        Enter a code (e.g., "robot-1") for auto-generated avatar, or a full image URL
                      </p>
                    </div>
                    {(avatarUrl || businessName) && (
                      <div className="flex items-center gap-2 bg-black border border-border rounded-lg p-2">
                        <span className="text-xs text-text-secondary">Preview:</span>
                        <img
                          src={displayAvatarUrl}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Dropdown
                    label="Category"
                    options={[
                      { value: "food", label: "Food & Beverage" },
                      { value: "retail", label: "Retail" },
                      { value: "service", label: "Service" },
                      { value: "entertainment", label: "Entertainment" },
                      { value: "health", label: "Health & Fitness" },
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
                    Deploy Loyalty Program
                  </>
                )}
              </button>
            )}
            <p className="text-center text-text-secondary text-xs mb-20">
              Requires approx. 0.05 SOL for account initialization and rent.
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

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
