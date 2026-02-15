export default function FeaturesGrid() {
  const features = [
    {
      id: "token-creation",
      icon: (
        <svg
          className="w-8 h-8 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          role="img"
          aria-label="Token Creation Icon"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      title: "Token Creation",
      description:
        "Launch custom loyalty tokens instantly with pre-built templates.",
    },
    {
      id: "customer-dashboard",
      icon: (
        <svg
          className="w-8 h-8 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          role="img"
          aria-label="Customer Dashboard Icon"
        >
          <circle cx="6" cy="12" r="4" />
          <rect x="14" y="8" width="8" height="8" />
        </svg>
      ),
      title: "Customer Dashboard",
      description:
        "Provide a seamless interface for users to track and spend rewards.",
    },
    {
      id: "business-analytics",
      icon: (
        <svg
          className="w-8 h-8 stroke-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          role="img"
          aria-label="Business Analytics Icon"
        >
          <rect x="4" y="4" width="16" height="16" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: "Business Analytics",
      description:
        "Real-time data on engagement, retention, and token velocity.",
    },
  ];

  return (
    <section className="grid grid-cols-3 gap-px bg-border">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="bg-bg-primary p-10 flex flex-col gap-6 relative transition-all duration-400 cursor-pointer before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-accent before:scale-x-0 before:origin-left before:transition-transform before:duration-400 hover:before:scale-x-100 hover:bg-panel hover:-translate-y-2"
        >
          <div className="transition-all duration-400">{feature.icon}</div>
          <div>
            <h2 className="text-lg font-medium mb-2">{feature.title}</h2>
            <p className="text-[0.85rem] text-text-secondary leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
