import Footer from "@/components/layout/Footer";
import LandingNavbar from "@/components/layout/LandingNavbar";

/**
 * Explore Layout Component
 *
 * Provides the layout structure for merchant exploration pages including:
 * - Landing navigation bar (public-facing)
 * - Main content area
 * - Footer
 *
 * This layout is applied to all routes under /explore/*
 * Uses the public landing navbar instead of authenticated customer navbar
 *
 * @param children - Child page components to render
 * @returns Layout wrapper with public navigation and footer
 */
export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
