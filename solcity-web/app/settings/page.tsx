"use client";

import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tierUpgrades, setTierUpgrades] = useState(true);
  const [bonusEvents, setBonusEvents] = useState(true);
  const [redemptionConfirmations, setRedemptionConfirmations] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Navigation */}
      <nav className="h-[72px] border-b border-border flex items-center justify-between px-8 bg-background sticky top-0 z-50">
        <Link href="/" className="text-lg font-bold tracking-wider flex gap-3 items-center">
          <div className="w-3.5 h-3.5 bg-accent" />
          SOLCITY
        </Link>
        <div className="flex gap-10">
          <Link href="/merchant" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            For Businesses
          </Link>
          <Link href="/explore" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            Explore Merchants
          </Link>
          <Link href="/dashboard" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            Dashboard
          </Link>
          <Link href="/profile" className="text-text-secondary text-sm font-medium hover:text-accent transition-colors">
            Profile
          </Link>
        </div>
        <button
          type="button"
          className="border border-border bg-transparent text-text-primary px-6 py-3 text-sm font-medium rounded transition-all"
        >
          8xPz...4v9k
        </button>
      </nav>

      {/* Settings Container */}
      <div className="max-w-[1200px] mx-auto my-16 px-8 grid grid-cols-[280px_1fr] gap-16 w-full">
        {/* Sidebar */}
        <aside className="flex flex-col gap-2">
          <a
            href="#profile"
            className="px-4 py-3 text-accent bg-accent/5 text-sm font-medium rounded-md transition-all"
          >
            Profile Settings
          </a>
          <a
            href="#wallet"
            className="px-4 py-3 text-text-secondary text-sm font-medium rounded-md transition-all hover:text-text-primary hover:bg-white/3"
          >
            Wallet Management
          </a>
          <a
            href="#notifications"
            className="px-4 py-3 text-text-secondary text-sm font-medium rounded-md transition-all hover:text-text-primary hover:bg-white/3"
          >
            Notifications
          </a>
          <a
            href="#display"
            className="px-4 py-3 text-text-secondary text-sm font-medium rounded-md transition-all hover:text-text-primary hover:bg-white/3"
          >
            Display & Currency
          </a>
          <a
            href="#privacy"
            className="px-4 py-3 text-text-secondary text-sm font-medium rounded-md transition-all hover:text-text-primary hover:bg-white/3"
          >
            Privacy & Data
          </a>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-12">

          {/* Profile Settings */}
          <section id="profile" className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Profile Settings</h2>
              <p className="text-text-secondary text-sm">Manage how you appear to others on the Solcity platform.</p>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="w-20 h-20 bg-panel border border-border rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <button
                type="button"
                className="bg-transparent border border-border text-text-primary px-4 py-2 rounded-md font-semibold text-sm transition-all hover:border-text-secondary"
              >
                Change Avatar
              </button>
            </div>

            <div className="flex flex-col gap-3 max-w-[500px]">
              <label htmlFor="displayName" className="text-sm font-medium text-text-secondary">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                className="bg-panel border border-border px-4 py-3.5 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                defaultValue="Satoshi_Nakamoto"
              />
            </div>

            <div className="flex flex-col gap-3 max-w-[500px]">
              <label htmlFor="bio" className="text-sm font-medium text-text-secondary">
                Bio
              </label>
              <textarea
                id="bio"
                className="bg-panel border border-border px-4 py-3.5 rounded-lg text-white text-sm min-h-[100px] resize-none focus:outline-none focus:border-accent"
                defaultValue="Collecting rewards and supporting local merchants since 2024."
              />
            </div>

            <button
              type="button"
              className="bg-accent text-black border-none px-8 py-3.5 rounded-md font-semibold text-sm cursor-pointer w-fit transition-all hover:opacity-90 hover:-translate-y-0.5"
            >
              Save Changes
            </button>
          </section>

          {/* Wallet Management */}
          <section id="wallet" className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Wallet Management</h2>
              <p className="text-text-secondary text-sm">Control your connected blockchain identities.</p>
            </div>

            <div className="bg-panel border border-border p-5 rounded-xl flex justify-between items-center max-w-[500px]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#512DA8] rounded-md" />
                <div>
                  <h4 className="text-sm">8xPz...4v9k</h4>
                  <p className="text-xs text-text-secondary">Phantom Wallet • Mainnet</p>
                </div>
              </div>
              <button
                type="button"
                className="text-[#FF4B4B] text-xs font-semibold bg-none border-none cursor-pointer uppercase tracking-wider"
              >
                Disconnect
              </button>
            </div>
          </section>

          {/* Notification Preferences */}
          <section id="notifications" className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Notification Preferences</h2>
              <p className="text-text-secondary text-sm">Choose which updates you want to receive.</p>
            </div>

            <div>
              <div className="flex justify-between items-center py-5 border-b border-border max-w-[700px]">
                <div>
                  <h4 className="text-base font-medium mb-1">Email Notifications</h4>
                  <p className="text-sm text-text-secondary">
                    Receive tier updates and weekly reports via sato***@gmail.com
                  </p>
                </div>
                <label className="relative inline-block w-11 h-[22px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0 peer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
                </label>
              </div>

              <div className="flex justify-between items-center py-5 border-b border-border max-w-[700px]">
                <div>
                  <h4 className="text-base font-medium mb-1">Tier Upgrades</h4>
                  <p className="text-sm text-text-secondary">
                    Browser push notifications when you reach a new loyalty tier
                  </p>
                </div>
                <label className="relative inline-block w-11 h-[22px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0 peer"
                    checked={tierUpgrades}
                    onChange={(e) => setTierUpgrades(e.target.checked)}
                  />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
                </label>
              </div>

              <div className="flex justify-between items-center py-5 border-b border-border max-w-[700px]">
                <div>
                  <h4 className="text-base font-medium mb-1">Bonus Events</h4>
                  <p className="text-sm text-text-secondary">
                    Alerts for limited-time reward multipliers from followed merchants
                  </p>
                </div>
                <label className="relative inline-block w-11 h-[22px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0 peer"
                    checked={bonusEvents}
                    onChange={(e) => setBonusEvents(e.target.checked)}
                  />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
                </label>
              </div>

              <div className="flex justify-between items-center py-5 border-b border-border max-w-[700px]">
                <div>
                  <h4 className="text-base font-medium mb-1">Redemption Confirmations</h4>
                  <p className="text-sm text-text-secondary">Instant notifications when you spend SLCY tokens</p>
                </div>
                <label className="relative inline-block w-11 h-[22px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="opacity-0 w-0 h-0 peer"
                    checked={redemptionConfirmations}
                    onChange={(e) => setRedemptionConfirmations(e.target.checked)}
                  />
                  <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
                </label>
              </div>
            </div>
          </section>

          {/* Display Preferences */}
          <section id="display" className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Display Preferences</h2>
              <p className="text-text-secondary text-sm">Customize your visual experience.</p>
            </div>

            <div className="flex flex-col gap-3 max-w-[500px]">
              <label htmlFor="theme" className="text-sm font-medium text-text-secondary">
                Theme
              </label>
              <select
                id="theme"
                className="bg-panel border border-border px-4 py-3.5 rounded-lg text-white text-sm w-[200px] cursor-pointer"
              >
                <option>Dark (Default)</option>
                <option>Light</option>
                <option>System</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 max-w-[500px]">
              <label htmlFor="currency" className="text-sm font-medium text-text-secondary">
                Currency Display
              </label>
              <select
                id="currency"
                className="bg-panel border border-border px-4 py-3.5 rounded-lg text-white text-sm w-[200px] cursor-pointer"
              >
                <option>USD - US Dollar</option>
                <option>NPR - Nepalese Rupee</option>
                <option>EUR - Euro</option>
                <option>SOL - Solana</option>
              </select>
            </div>
          </section>

          {/* Privacy & Data */}
          <section id="privacy" className="flex flex-col gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Privacy & Data</h2>
              <p className="text-text-secondary text-sm">Control your data visibility and export history.</p>
            </div>

            <div className="flex justify-between items-center py-5 border-b border-border max-w-[700px]">
              <div>
                <h4 className="text-base font-medium mb-1">Public Profile</h4>
                <p className="text-sm text-text-secondary">
                  Allow others to see your collection and tier status on leaderboards
                </p>
              </div>
              <label className="relative inline-block w-11 h-[22px] cursor-pointer">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0 peer"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                />
                <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
              </label>
            </div>

            <div className="mt-4">
              <h4 className="text-base font-medium mb-4">Data Export</h4>
              <p className="text-sm text-text-secondary mb-6">
                Download your entire transaction history and rewards data.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="bg-transparent border border-border text-text-primary px-8 py-3.5 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all hover:border-text-secondary"
                >
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  className="bg-transparent border border-border text-text-primary px-8 py-3.5 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all hover:border-text-secondary"
                >
                  <span>Download JSON</span>
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-panel border-t border-border py-16 px-8 mt-auto">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[2fr_1fr_1fr_1fr] gap-16">
          <div>
            <div className="text-lg font-bold tracking-wider flex gap-3 items-center mb-4">
              <div className="w-3.5 h-3.5 bg-accent" />
              SOLCITY
            </div>
            <p className="text-text-secondary leading-relaxed">The future of loyalty. Built on Solana.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Product</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/explore" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-text-secondary text-sm hover:text-accent transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
