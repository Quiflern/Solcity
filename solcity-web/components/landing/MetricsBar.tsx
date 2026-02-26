"use client";

import {
  formatMetricValue,
  usePlatformMetrics,
} from "@/hooks/program/usePlatformMetrics";

/**
 * MetricsBar Component
 *
 * Displays key platform metrics in a horizontal bar on the landing page.
 * Shows social proof through active businesses, token distribution, and user counts.
 *
 * Features:
 * - 3-column grid of metric cards
 * - Real-time metrics from blockchain
 * - Hover effects with bottom accent line animation
 * - Auto-refreshes every minute
 */
export default function MetricsBar() {
  const { metrics, isLoading } = usePlatformMetrics();

  const metricsData = [
    {
      id: "businesses",
      label: "Active Businesses",
      value: formatMetricValue(metrics.activeMerchants),
    },
    {
      id: "tokens",
      label: "Tokens Distributed",
      value: formatMetricValue(metrics.tokensDistributed),
    },
    {
      id: "wallets",
      label: "Customer Wallets",
      value: formatMetricValue(metrics.totalCustomers),
    },
  ];

  return (
    <section className="border-b border-border bg-bg-primary py-8">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-3 gap-8">
          {metricsData.map((metric) => (
            <div
              key={metric.id}
              className="bg-panel border border-border p-6 flex justify-between items-center relative overflow-hidden transition-all duration-300 hover:bg-[#1a1a1a] hover:border-accent before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:bg-accent before:scale-x-0 before:transition-transform before:duration-400 hover:before:scale-x-100"
            >
              <div>
                <h4 className="text-[0.7rem] uppercase tracking-widest text-text-secondary mb-1">
                  {metric.label}
                </h4>
                <span className="text-2xl font-medium tracking-tight transition-all duration-300 inline-block">
                  {isLoading ? "..." : metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
