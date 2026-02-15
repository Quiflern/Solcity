"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  className = "",
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, borderColor: "var(--accent-lime)" }}
      className={`bg-panel border border-border p-6 rounded-lg transition-all cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[0.7rem] uppercase text-text-secondary tracking-wider">
          {label}
        </h4>
        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="text-accent"
          >
            {icon}
          </motion.div>
        )}
      </div>
      <motion.p
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: delay + 0.1 }}
        className="text-2xl font-semibold"
      >
        {value}
      </motion.p>
      {trend && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.2 }}
          className={`text-xs mt-2 flex items-center gap-1 ${trend.isPositive ? "text-green-500" : "text-red-500"
            }`}
        >
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {trend.value}
        </motion.div>
      )}
    </motion.div>
  );
}
