import MerchantNavbar from "@/components/layout/MerchantNavbar";
import Footer from "@/components/layout/Footer";

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
