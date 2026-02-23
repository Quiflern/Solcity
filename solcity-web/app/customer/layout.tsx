import CustomerNavbar from "@/components/layout/CustomerNavbar";
import Footer from "@/components/layout/Footer";

/**
 * Customer Layout Component
 *
 * Provides the layout structure for all customer-facing pages including:
 * - Customer navigation bar with wallet connection
 * - Main content area
 * - Footer
 *
 * This layout is applied to all routes under /customer/*
 *
 * @param children - Child page components to render
 * @returns Layout wrapper with navigation and footer
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CustomerNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
