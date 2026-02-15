export default function MetricsBar() {
  const metrics = [
    { id: "businesses", label: "Active Businesses", value: "1,247" },
    { id: "tokens", label: "Tokens Distributed", value: "18.4M" },
    { id: "wallets", label: "Customer Wallets", value: "342K" },
  ];

  return (
    <section className="border-b border-border bg-bg-primary py-8">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-3 gap-8">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-panel border border-border p-6 flex justify-between items-center relative overflow-hidden transition-all duration-300 hover:bg-[#1a1a1a] hover:border-accent before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-accent before:scale-x-0 before:transition-transform before:duration-400 hover:before:scale-x-100"
            >
              <div>
                <h4 className="text-[0.7rem] uppercase tracking-widest text-text-secondary mb-1">
                  {metric.label}
                </h4>
                <span className="text-2xl font-medium tracking-tight transition-all duration-300 inline-block">
                  {metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
