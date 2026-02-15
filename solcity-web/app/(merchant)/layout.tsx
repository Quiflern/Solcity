import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="connected" walletAddress="Coffee_Shop.sol" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
