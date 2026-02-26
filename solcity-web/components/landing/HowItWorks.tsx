/**
 * HowItWorks Component
 *
 * Explains the three-step process for using Solcity platform.
 * Designed for both merchants and customers to understand the flow.
 *
 * Features:
 * - Three-step process visualization
 * - Numbered steps with icons
 * - Hover effects with scale and glow
 * - Clear, concise explanations
 */
export default function HowItWorks() {
  const steps = [
    {
      id: "step-1",
      number: "01",
      title: "Register & Create",
      description:
        "Merchants register and create custom loyalty tokens. Customers connect their wallet to join.",
      icon: (
        <svg
          className="w-12 h-12 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
    {
      id: "step-2",
      number: "02",
      title: "Earn & Track",
      description:
        "Customers earn tokens with every purchase. All transactions are transparent and tracked on-chain.",
      icon: (
        <svg
          className="w-12 h-12 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M7 17L17 7M17 7H7M17 7V17" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="7" r="2" />
        </svg>
      ),
    },
    {
      id: "step-3",
      number: "03",
      title: "Redeem & Enjoy",
      description:
        "Redeem tokens for exclusive offers, discounts, and rewards. Instant verification via blockchain.",
      icon: (
        <svg
          className="w-12 h-12 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-panel border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-medium tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
            Get started with Solcity in three simple steps. Built on Solana for
            speed and transparency.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-bg-primary border border-border p-10 flex flex-col gap-6 relative overflow-hidden transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:bg-[#1a1a1a] hover:border-accent"
            >
              {/* Step number badge */}
              <div className="absolute top-6 right-6 text-6xl font-bold text-border transition-colors duration-300">
                {step.number}
              </div>

              {/* Icon */}
              <div className="relative z-10 transition-all duration-300">
                {step.icon}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-[0.9rem] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-4 w-8 h-[2px] bg-border hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
