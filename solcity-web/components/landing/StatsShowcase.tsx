/**
 * StatsShowcase Component
 *
 * Highlights key platform performance statistics on the landing page.
 * Emphasizes reliability, speed, and support availability.
 *
 * Features:
 * - 3-column centered grid of statistics
 * - Large accent-colored numbers with hover effects
 * - Glow and scale animations on hover
 * - Stats: 99.9% Uptime, <1s Transaction Speed, 24/7 Support
 */
export default function StatsShowcase() {
  const stats = [
    { id: "uptime", number: "99.9%", label: "Uptime Guarantee" },
    { id: "speed", number: "<1s", label: "Transaction Speed" },
    { id: "support", number: "24/7", label: "Support Available" },
  ];

  return (
    <section className="py-20 bg-panel border-b border-border text-center">
      <div className="max-w-[1400px] mx-auto px-8">
        <h3 className="text-[0.85rem] uppercase tracking-[0.15em] text-text-secondary mb-12">
          Trusted by businesses worldwide
        </h3>
        <div className="grid grid-cols-3 gap-16 max-w-[900px] mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-2 transition-all duration-300 cursor-pointer hover:-translate-y-2.5"
            >
              <span className="text-5xl font-semibold text-accent tracking-tight transition-all duration-300 inline-block">
                {stat.number}
              </span>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
