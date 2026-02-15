import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-[8rem] font-bold text-accent leading-none mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-text-secondary text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary">Explore Merchants</Button>
          </Link>
        </div>

        <div className="mt-16 border border-border p-8 bg-panel">
          <h3 className="text-sm uppercase tracking-wider text-text-secondary mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Link href="/dashboard" className="text-text-primary hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-text-primary hover:text-accent transition-colors">
              Profile
            </Link>
            <Link href="/merchant" className="text-text-primary hover:text-accent transition-colors">
              Merchant Portal
            </Link>
            <Link href="/settings" className="text-text-primary hover:text-accent transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
