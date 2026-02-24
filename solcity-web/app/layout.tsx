import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import WalletQueryInvalidator from "@/components/providers/WalletQueryInvalidator";
import Toaster from "@/components/ui/Toaster";
import { IconPickerProvider } from "@/contexts/IconPickerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solcity - Decentralized Loyalty Platform",
  description: "Reward customers with blockchain tokens. Fast, transparent, and owned by customers.",
};

/**
 * Root Layout Component
 *
 * The top-level layout for the entire Solcity application.
 * Wraps all pages with essential providers and global configurations.
 *
 * Provider Hierarchy (outer to inner):
 * 1. QueryProvider - React Query for data fetching and caching
 * 2. WalletProvider - Solana wallet adapter for blockchain connections
 * 3. IconPickerProvider - Icon selection context for UI components
 * 4. WalletQueryInvalidator - Invalidates queries on wallet changes
 * 5. Toaster - Global toast notification system
 *
 * Features:
 * - Inter font family for consistent typography
 * - Global CSS styles and Tailwind configuration
 * - SEO metadata (title, description)
 * - Wallet connection management
 * - Query caching and synchronization
 * - Toast notifications for user feedback
 *
 * This layout is applied to all routes in the application.
 *
 * @param children - Page components to render
 * @returns Root HTML structure with all providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <WalletProvider>
            <IconPickerProvider>
              <WalletQueryInvalidator />
              {children}
              <Toaster />
            </IconPickerProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
