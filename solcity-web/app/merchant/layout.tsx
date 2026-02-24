import Footer from "@/components/layout/Footer";
import MerchantNavbar from "@/components/layout/MerchantNavbar";

/**
 * Merchant Layout Component
 *
 * Provides the layout structure for all merchant-facing pages including:
 * - Merchant navigation bar with wallet connection and menu
 * - Main content area
 * - Footer
 *
 * This layout is applied to all routes under /merchant/*
 * Includes navigation to dashboard, rules, offers, analytics, and profile.
 *
 * @param children - Child page components to render
 * @returns Layout wrapper with merchant navigation and footer
 */
export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MerchantNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
