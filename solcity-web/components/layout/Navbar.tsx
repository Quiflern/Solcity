"use client";

export default function Navbar() {
  return (
    <nav className="h-[72px] border-b border-border flex items-center justify-between px-8 bg-bg-primary z-100">
      <div className="flex gap-3 items-center text-lg font-bold tracking-wider">
        <div className="w-[14px] h-[14px] bg-accent" />
        SOLCITY
      </div>

      <div className="flex gap-10">
        <a
          href="/businesses"
          className="text-text-secondary text-sm font-medium transition-all duration-300 relative pb-1 hover:text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          For Businesses
        </a>
        <a
          href="/customers"
          className="text-text-secondary text-sm font-medium transition-all duration-300 relative pb-1 hover:text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          For Customers
        </a>
        <a
          href="/token-extensions"
          className="text-text-secondary text-sm font-medium transition-all duration-300 relative pb-1 hover:text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          Token Extensions
        </a>
        <a
          href="/docs"
          className="text-text-secondary text-sm font-medium transition-all duration-300 relative pb-1 hover:text-accent after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
        >
          Docs
        </a>
      </div>

      <button
        type="button"
        className="border border-border bg-transparent text-text-primary px-8 py-4 text-sm font-medium cursor-pointer transition-all duration-300 rounded hover:border-accent hover:bg-accent/10 hover:text-accent"
      >
        Connect Wallet
      </button>
    </nav>
  );
}
