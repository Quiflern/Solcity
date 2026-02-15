"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { useState } from "react";

export default function ExploreMerchantsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const merchants = [
    {
      id: "merchant-1",
      name: "Ethos Coffee Roasters",
      category: "Food & Beverage",
      icon: "☕",
      earnRate: "5 SLCY / $1",
      apy: "8.5%",
      customers: "12.4k Customers",
      joined: "Joined Jan 2024",
    },
    {
      id: "merchant-2",
      name: "Nexus Apparel",
      category: "Retail",
      icon: "👕",
      earnRate: "10 SLCY / $1",
      apy: "12.0%",
      customers: "8.2k Customers",
      joined: "Joined Feb 2024",
    },
    {
      id: "merchant-3",
      name: "Core Collective Gym",
      category: "Services",
      icon: "💪",
      earnRate: "50 SLCY / Visit",
      apy: "15.0%",
      customers: "3.1k Customers",
      joined: "Joined Nov 2023",
    },
    {
      id: "merchant-4",
      name: "Apex Cinemas",
      category: "Entertainment",
      icon: "🎟️",
      earnRate: "15 SLCY / $1",
      apy: "6.2%",
      customers: "24.5k Customers",
      joined: "Joined Mar 2024",
    },
    {
      id: "merchant-5",
      name: "Green Leaf Kitchen",
      category: "Food & Beverage",
      icon: "🥗",
      earnRate: "8 SLCY / $1",
      apy: "9.0%",
      customers: "5.7k Customers",
      joined: "Joined Dec 2023",
    },
    {
      id: "merchant-6",
      name: "Horizon Travels",
      category: "Travel",
      icon: "✈️",
      earnRate: "2 SLCY / $1",
      apy: "5.5%",
      customers: "42.1k Customers",
      joined: "Joined Jan 2024",
    },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      {/* Header */}
      <header className="py-16 px-12 pb-8 max-w-[1200px] mx-auto w-full">
        <h1 className="text-[2.5rem] font-medium tracking-tight mb-4">
          Discover rewards in <span className="text-accent">Solcity.</span>
        </h1>
        <p className="text-text-secondary max-w-[600px]">
          Browse and join loyalty programs from world-class businesses. Earn
          blockchain tokens on every purchase and watch your rewards grow.
        </p>

        <div className="flex gap-4 mt-8 max-w-[600px]">
          <input
            type="text"
            className="flex-1 bg-panel border border-border px-6 py-4 rounded-lg text-text text-base transition-colors outline-none focus:border-accent"
            placeholder="Search merchants, categories, or tokens..."
          />
        </div>

        <div className="flex gap-2 mt-8 border-b border-border pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "all"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            All Merchants
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("food")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "food"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            Food & Beverage
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("retail")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "retail"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            Retail
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("services")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "services"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("entertainment")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "entertainment"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            Entertainment
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("travel")}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeFilter === "travel"
              ? "text-accent border-accent"
              : "text-text-secondary border-transparent hover:text-text"
              }`}
          >
            Travel
          </button>
        </div>
      </header>

      {/* Merchant Grid */}
      <main className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 max-w-[1200px] mx-auto mb-20 px-12 w-full">
        {merchants.map((merchant) => (
          <Link
            key={merchant.id}
            href={`/explore/${merchant.id}`}
            className="bg-panel border border-border rounded-xl p-6 transition-all duration-300 cursor-pointer flex flex-col gap-6 relative overflow-hidden hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] after:content-[''] after:absolute after:top-0 after:right-0 after:w-20 after:h-20 after:bg-[radial-gradient(circle_at_top_right,rgba(208,255,20,0.05),transparent_70%)]"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-bg border border-border rounded-lg flex items-center justify-center font-bold text-accent text-xl">
                {merchant.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{merchant.name}</h3>
                <span className="text-[0.7rem] uppercase tracking-wider text-text-secondary bg-white/5 px-2 py-0.5 rounded">
                  {merchant.category}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-bg p-4 rounded-lg border border-white/3">
              <div className="flex flex-col gap-1">
                <span className="text-[0.7rem] text-text-secondary uppercase">
                  Earn Rate
                </span>
                <span className="text-base font-semibold text-accent">
                  {merchant.earnRate}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.7rem] text-text-secondary uppercase">
                  Staking APY
                </span>
                <span className="text-base font-semibold text-accent">
                  {merchant.apy}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <span>{merchant.customers}</span>
              </div>
              <div className="w-1 h-1 bg-border rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>{merchant.joined}</span>
              </div>
            </div>
          </Link>
        ))}
      </main>

      <Footer />
    </div>
  );
}
