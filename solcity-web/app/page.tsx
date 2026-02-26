import ActivitySection from "@/components/landing/ActivitySection";
import CTASection from "@/components/landing/CTASection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HeroBanner from "@/components/landing/HeroBanner";
import HowItWorks from "@/components/landing/HowItWorks";
import MetricsBar from "@/components/landing/MetricsBar";
import StatsShowcase from "@/components/landing/StatsShowcase";
import UseCases from "@/components/landing/UseCases";
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
 * 1. LandingNavbar - Logo, navigation, wallet connection
 * 2. HeroBanner - Main headline, value proposition, CTAs
 * 3. MetricsBar - Key platform statistics and social proof
 * 4. FeaturesGrid - Core platform features for merchants and customers
 * 5. HowItWorks - Three-step process explanation
 * 6. UseCases - Real-world business use cases and benefits
 * 7. StatsShowcase - Platform reliability and performance stats
 * 8. ActivitySection - Real-time blockchain activity feed
 * 9. CTASection - Final call-to-action before footer
 * 10. Footer - Links, social media, legal information
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
        <HowItWorks />
        <UseCases />
        <StatsShowcase />
        <ActivitySection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
