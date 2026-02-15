import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar variant="connected" walletAddress="8xY2...pL9n" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
