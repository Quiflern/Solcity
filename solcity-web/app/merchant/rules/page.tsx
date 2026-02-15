"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";

export default function MerchantRulesPage() {
  const [rules] = useState([
    {
      id: "rule-1",
      name: "Base Issuance Rate",
      description: "Earn 1.0 SLCY for every $1.00 spent.",
      icon: "dollar",
      minimum: "No Minimum",
      status: "Always Active",
      enabled: true,
    },
    {
      id: "rule-2",
      name: "Happy Hour Multiplier",
      description: "2.0x bonus on all purchases.",
      icon: "bolt",
      minimum: "Min $5.00",
      status: "Ends Nov 30",
      enabled: true,
    },
    {
      id: "rule-3",
      name: "Platinum Tier Bonus",
      description: "1.5x Multiplier for Platinum members.",
      icon: "users",
      minimum: "No Minimum",
      status: "Always Active",
      enabled: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar variant="connected" walletAddress="Coffee_Shop.sol" />

      {/* Page Header */}
      <div className="px-10 py-10 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Reward Rules</h1>
          <p className="text-text-secondary text-sm mt-1">
            Configure how your customers earn SLCY tokens.
          </p>
        </div>
        <button
          type="button"
          className="bg-accent text-black px-6 py-3 border-none font-bold text-sm cursor-pointer rounded-lg"
        >
          + Create New Rule
        </button>
      </div>

      {/* Dashboard Layout */}
      <div className="grid grid-cols-[1fr_450px] px-10 pb-10 gap-10">
        {/* Main Content - Rules List */}
        <div className="flex flex-col gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-panel border border-border rounded-xl py-5 px-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-accent">
                  {rule.icon === "dollar" && (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Dollar"
                    >
                      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.646 1M12 8V7m0 11v-1m0-5V7m0 11c-1.11 0-2.08-.407-2.646-1" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                  {rule.icon === "bolt" && (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Bolt"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {rule.icon === "users" && (
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Users"
                    >
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-semibold mb-1">{rule.name}</h4>
                  <p className="text-xs text-text-secondary">
                    {rule.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <span className="block text-sm font-medium">
                    {rule.minimum}
                  </span>
                  <span className="text-[0.7rem] text-text-secondary">
                    {rule.status}
                  </span>
                </div>
                <div className="flex gap-3">
                  <label className="relative inline-block w-9 h-5">
                    <input
                      type="checkbox"
                      defaultChecked={rule.enabled}
                      className="opacity-0 w-0 h-0 peer"
                    />
                    <span className="absolute cursor-pointer inset-0 bg-[#333] rounded-full transition-all peer-checked:bg-accent before:content-[''] before:absolute before:h-3.5 before:w-3.5 before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-4 peer-checked:before:bg-black" />
                  </label>
                  <button
                    type="button"
                    className="bg-transparent border border-border text-text-secondary px-3 py-1.5 text-xs rounded cursor-pointer hover:border-text-secondary hover:text-text"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Rule Card */}
          <div className="bg-panel border border-dashed border-border rounded-xl py-5 px-6 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-text-secondary">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Add"
                >
                  <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-secondary">
                  Add conditional bonus...
                </h4>
              </div>
            </div>
            <button
              type="button"
              className="bg-transparent border-none text-text-secondary px-3 py-1.5 text-xs cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>

        {/* Sidebar - Rule Builder */}
        <aside>
          <div className="bg-panel border border-border rounded-xl p-8 sticky top-[92px]">
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
              <label
                htmlFor="rule-type"
                className="block text-xs text-text-secondary mb-2"
              >
                Rule Type
              </label>
              <select
                id="rule-type"
                className="w-full bg-black border border-border text-text px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-accent"
              >
                <option>Bonus Multiplier</option>
                <option>Base Reward</option>
                <option>First Purchase Bonus</option>
                <option>Referral Bonus</option>
                <option>Tier Bonus</option>
                <option>Streak Bonus</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mb-5">
                <label
                  htmlFor="multiplier"
                  className="block text-xs text-text-secondary mb-2"
                >
                  Multiplier
                </label>
                <select
                  id="multiplier"
                  className="w-full bg-black border border-border text-text px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-accent"
                >
                  <option>1.0x</option>
                  <option>1.5x</option>
                  <option selected>2.0x</option>
                  <option>3.0x</option>
                </select>
              </div>
              <div className="mb-5">
                <label
                  htmlFor="min-purchase"
                  className="block text-xs text-text-secondary mb-2"
                >
                  Min. Purchase ($)
                </label>
                <input
                  id="min-purchase"
                  type="number"
                  defaultValue="10.00"
                  className="w-full bg-black border border-border text-text px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mb-5">
                <label
                  htmlFor="start-date"
                  className="block text-xs text-text-secondary mb-2"
                >
                  Start Date (Opt.)
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="w-full bg-black border border-border text-text px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-accent"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="end-date"
                  className="block text-xs text-text-secondary mb-2"
                >
                  End Date (Opt.)
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="w-full bg-black border border-border text-text px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-accent"
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
                <span>Happy Hour Bonus (2.0x)</span>
                <span>+100.00 SLCY</span>
              </div>
              <div className="flex justify-between text-xs text-text-secondary mb-2.5 opacity-40">
                <span>
                  <span className="text-[0.65rem] px-1.5 py-0.5 rounded font-semibold mr-1.5 bg-accent text-black">
                    PLATINUM
                  </span>
                  Tier Bonus (1.5x)
                </span>
                <span>+50.00 SLCY</span>
              </div>

              <div className="flex justify-between text-base font-bold mt-3 pt-3 border-t border-border">
                <span>Total Reward</span>
                <span className="text-accent">200.00 SLCY</span>
              </div>
            </div>

            <button
              type="button"
              className="bg-accent text-black px-4 py-3.5 border-none font-bold text-sm cursor-pointer rounded-lg w-full mt-4"
            >
              Save Rule Changes
            </button>
            <button
              type="button"
              className="bg-transparent border-none text-[#ff4d4d] px-4 py-2.5 text-sm cursor-pointer w-full mt-2.5"
            >
              Delete Rule
            </button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
