import LandingNavbar from "@/components/layout/LandingNavbar";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      {children}
    </>
  );
}
