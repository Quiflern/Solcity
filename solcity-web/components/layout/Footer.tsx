import Link from "next/link";

/**
 * Footer Component
 *
 * Site-wide footer with navigation links, branding, and legal information.
 * Organized into four columns: Brand, Product, Resources, and Legal.
 *
 * Features:
 * - Brand identity with Solcity logo and tagline
 * - Product navigation (Explore, Merchant registration, Dashboard)
 * - Resource links (Documentation, Help, Blog, Community)
 * - Legal links (Privacy, Terms, Cookies)
 * - Dynamic copyright year
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-panel border-t border-border py-16 mt-auto">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16">
          {/* Brand Column */}
          <div>
            <div className="text-lg font-bold tracking-wider flex gap-3 items-center mb-4">
              <div className="w-3.5 h-3.5 bg-accent" />
              SOLCITY
            </div>
            <p className="text-text-secondary leading-relaxed">
              The future of loyalty. Built on Solana.
            </p>
            <p className="text-text-secondary text-xs mt-4">
              © {currentYear} Solcity Network. All rights reserved.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/explore"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/merchant/register"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  For Merchants
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">
              Resources
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-xs uppercase text-text-secondary mb-6">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-text-secondary text-sm hover:text-accent transition-colors"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
