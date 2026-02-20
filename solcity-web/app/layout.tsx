import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import WalletQueryInvalidator from "@/components/providers/WalletQueryInvalidator";
import Toaster from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solcity - Decentralized Loyalty Platform",
  description: "Reward customers with blockchain tokens. Fast, transparent, and owned by customers.",
};

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
            <WalletQueryInvalidator />
            {children}
            <Toaster />
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
