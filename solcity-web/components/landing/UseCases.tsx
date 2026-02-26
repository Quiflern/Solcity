/**
 * UseCases Component
 *
 * Showcases real-world use cases and benefits of Solcity platform
 * for different types of businesses.
 *
 * Features:
 * - Four use case cards with industry-specific examples
 * - Hover effects with gradient overlay
 * - Icon-based visual representation
 * - Demonstrates versatility of the platform
 */
export default function UseCases() {
  const useCases = [
    {
      id: "retail",
      industry: "Retail",
      title: "Boost Repeat Purchases",
      description:
        "Reward customers for every purchase and watch them come back more often. Track customer behavior and optimize your rewards strategy.",
      icon: (
        <svg
          className="w-10 h-10 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 5.6M17 13l1.4 5.6M9 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      ),
      metric: "35% increase in repeat customers",
    },
    {
      id: "food",
      industry: "Food & Beverage",
      title: "Build Customer Loyalty",
      description:
        "Turn one-time visitors into regulars with token rewards. Create special offers for loyal customers and track redemption rates in real-time.",
      icon: (
        <svg
          className="w-10 h-10 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      metric: "50% higher customer retention",
    },
    {
      id: "fitness",
      industry: "Fitness & Wellness",
      title: "Motivate Members",
      description:
        "Reward members for consistency and milestones. Create tiered benefits that encourage long-term commitment and community engagement.",
      icon: (
        <svg
          className="w-10 h-10 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      metric: "40% boost in member engagement",
    },
    {
      id: "services",
      industry: "Professional Services",
      title: "Reward Referrals",
      description:
        "Incentivize client referrals with token rewards. Build a network effect where satisfied clients become your best marketers.",
      icon: (
        <svg
          className="w-10 h-10 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
        >
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      metric: "3x more referrals",
    },
  ];

  return (
    <section className="py-24 bg-bg-primary border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-medium tracking-tight mb-4">
            Built for Every Business
          </h2>
          <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
            From retail to restaurants, fitness to professional services.
            Solcity adapts to your business needs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.id}
              className="bg-panel border border-border p-10 flex flex-col gap-6 relative overflow-hidden transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:bg-[#1a1a1a] hover:border-accent"
            >
              {/* Content */}
              <div className="relative z-10 flex items-start gap-6">
                <div className="transition-all duration-300">
                  {useCase.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-accent mb-2">
                    {useCase.industry}
                  </div>
                  <h3 className="text-xl font-medium mb-3">{useCase.title}</h3>
                  <p className="text-[0.9rem] text-text-secondary leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm text-accent">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-medium">{useCase.metric}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
