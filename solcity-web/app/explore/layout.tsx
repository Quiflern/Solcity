import LandingNavbar from "@/components/layout/LandingNavbar";
import Footer from "@/components/layout/Footer";

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
