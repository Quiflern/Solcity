import ActivitySection from "@/components/landing/ActivitySection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HeroBanner from "@/components/landing/HeroBanner";
import MetricsBar from "@/components/landing/MetricsBar";
import StatsShowcase from "@/components/landing/StatsShowcase";
import Footer from "@/components/layout/Footer";
import LandingNavbar from "@/components/layout/LandingNavbar";

/**
 * Landing Page (Home)
 *
 * The main entry point and marketing page for Solcity.
 * Introduces the platform and its value proposition to new visitors.
 *
 * Page Structure (top to bottom):
 *
 * 1. LandingNavbar
 *    - Logo and branding
 *    - Navigation links (Explore, For Merchants)
 *    - Wallet connection button
 *
 * 2. HeroBanner
 *    - Main headline and value proposition
 *    - Call-to-action buttons (Get Started, Learn More)
 *    - Hero image or animation
 *
 * 3. MetricsBar
 *    - Key platform statistics (merchants, customers, rewards issued)
 *    - Real-time or aggregated metrics
 *    - Social proof and credibility
 *
 * 4. FeaturesGrid
 *    - Core platform features and benefits
 *    - Icon-based feature cards
 *    - For both merchants and customers
 *
 * 5. StatsShowcase
 *    - Detailed statistics and charts
 *    - Platform growth and engagement metrics
 *    - Visual data representation
 *
 * 6. ActivitySection
 *    - Recent platform activity feed
 *    - Live transactions or events
 *    - Community engagement showcase
 *
 * 7. Footer
 *    - Links to important pages
 *    - Social media connections
 *    - Legal information
 *
 * This page is optimized for conversion, guiding visitors to either:
 * - Register as a merchant (business owners)
 * - Explore merchants (customers)
 * - Connect wallet and start using the platform
 *
 * @returns Landing page with marketing content and CTAs
 */
export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="w-full flex flex-col">
        <HeroBanner />
        <MetricsBar />
        <FeaturesGrid />
        <StatsShowcase />
        <ActivitySection />
      </main>
      <Footer />
    </>
  );
}
