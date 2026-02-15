import ActivitySection from "@/components/landing/ActivitySection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HeroBanner from "@/components/landing/HeroBanner";
import MetricsBar from "@/components/landing/MetricsBar";
import StatsShowcase from "@/components/landing/StatsShowcase";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full flex flex-col">
        <HeroBanner />
        <MetricsBar />
        <StatsShowcase />
        <FeaturesGrid />
        <ActivitySection />
      </main>
      <Footer />
    </>
  );
}
