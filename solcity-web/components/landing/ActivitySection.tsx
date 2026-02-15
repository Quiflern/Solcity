export default function ActivitySection() {
  const activities = [
    {
      id: "tokens-earned",
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          role="img"
          aria-label="Tokens Earned"
        >
          <path d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      ),
      title: "Tokens Earned",
      description: "Coffee Shop • 50 CAFE",
    },
    {
      id: "tokens-redeemed",
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          role="img"
          aria-label="Tokens Redeemed"
        >
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
        </svg>
      ),
      title: "Tokens Redeemed",
      description: "Fitness Club • 200 FIT",
    },
    {
      id: "customer-join",
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          role="img"
          aria-label="New Customer"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7V12" />
        </svg>
      ),
      title: "New Customer Join",
      description: "Retail Store • 100 SHOP",
    },
    {
      id: "referral-bonus",
      icon: (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          role="img"
          aria-label="Referral Bonus"
        >
          <path d="M7 17L17 7" />
        </svg>
      ),
      title: "Referral Bonus",
      description: "Restaurant • 25 DINE",
    },
  ];

  return (
    <section className="py-20 bg-bg-primary border-t border-border">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-3xl font-medium tracking-tight">Recent Activity</h3>
          <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_#d0ff14]" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-panel border border-border p-8 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:bg-[#1a1a1a] hover:border-accent"
            >
              <div className="w-10 h-10 border border-border flex items-center justify-center transition-all duration-300">
                <div className="w-[18px] stroke-accent">{activity.icon}</div>
              </div>
              <div>
                <h4 className="text-[0.95rem] font-medium mb-1">{activity.title}</h4>
                <p className="text-[0.8rem] text-text-secondary">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
