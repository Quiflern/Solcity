"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  variant?: "default" | "connected";
  walletAddress?: string;
}

export default function Navbar({ variant = "default", walletAddress }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <nav className="h-[72px] border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full max-w-[1400px] mx-auto px-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-wider flex gap-3 items-center">
          <div className="w-3.5 h-3.5 bg-accent" />
          SOLCITY
        </Link>

        <div className="flex gap-10">
          <Link
            href="/merchant"
            className={`text-sm font-medium transition-colors ${isActive("/merchant") ? "text-accent" : "text-text-secondary hover:text-accent"
              }`}
          >
            For Businesses
          </Link>
          <Link
            href="/explore"
            className={`text-sm font-medium transition-colors ${isActive("/explore") ? "text-accent" : "text-text-secondary hover:text-accent"
              }`}
          >
            Explore Merchants
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors ${isActive("/dashboard") ? "text-accent" : "text-text-secondary hover:text-accent"
              }`}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className={`text-sm font-medium transition-colors ${isActive("/profile") || isActive("/settings") ? "text-accent" : "text-text-secondary hover:text-accent"
              }`}
          >
            Profile
          </Link>
        </div>

        {variant === "connected" && walletAddress ? (
          <button
            type="button"
            className="border border-accent bg-accent/5 text-accent px-5 py-2.5 text-sm font-semibold rounded flex items-center gap-2 transition-all hover:bg-accent/10"
          >
            <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_#d0ff14]" />
            <span>{walletAddress}</span>
          </button>
        ) : (
          <button
            type="button"
            className="border border-border bg-transparent text-text-primary px-6 py-3 text-sm font-medium rounded transition-all hover:border-accent hover:text-accent"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
