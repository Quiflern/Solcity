export default function Footer() {
  return (
    <footer className="bg-panel border-t border-border px-12 py-16">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3 items-center text-lg font-bold tracking-wider">
            <div className="w-[14px] h-[14px] bg-accent" />
            SOLCITY
          </div>
          <p className="text-text-secondary leading-relaxed">
            Decentralized customer loyalty platform built on Solana. Fast,
            transparent, and on-chain rewards that customers actually own.
          </p>
        </div>

        <div>
          <h4 className="text-[0.75rem] uppercase tracking-widest text-text-secondary mb-6 font-semibold">
            Product
          </h4>
          <ul className="flex flex-col gap-4">
            <li>
              <a
                href="/features"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/pricing"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                href="/token-extensions"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Token Extensions
              </a>
            </li>
            <li>
              <a
                href="/roadmap"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Roadmap
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[0.75rem] uppercase tracking-widest text-text-secondary mb-6 font-semibold">
            Resources
          </h4>
          <ul className="flex flex-col gap-4">
            <li>
              <a
                href="/docs"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Documentation
              </a>
            </li>
            <li>
              <a
                href="/api"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                API Reference
              </a>
            </li>
            <li>
              <a
                href="/case-studies"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Case Studies
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[0.75rem] uppercase tracking-widest text-text-secondary mb-6 font-semibold">
            Company
          </h4>
          <ul className="flex flex-col gap-4">
            <li>
              <a
                href="/about"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/blog"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/careers"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-text-secondary text-sm transition-all duration-300 relative inline-block before:content-['→'] before:absolute before:-left-5 before:opacity-0 before:transition-all before:duration-300 hover:text-accent hover:translate-x-2.5 hover:before:opacity-100 hover:before:-left-[15px]"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-border text-center text-text-secondary text-sm">
        <p>
          © 2024 Solcity. All rights reserved. Powered by Solana blockchain.
        </p>
      </div>
    </footer>
  );
}
