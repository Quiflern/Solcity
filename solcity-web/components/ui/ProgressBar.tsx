"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: "accent" | "green" | "blue" | "red";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  color = "accent",
  size = "md",
  className = "",
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    accent: "bg-accent shadow-[0_0_15px_#d0ff14]",
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  const sizes = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2",
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between text-sm mb-2"
        >
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercentage && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-text-primary font-medium"
            >
              {percentage.toFixed(0)}%
            </motion.span>
          )}
        </motion.div>
      )}
      <div className={`bg-border rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: "easeOut",
          }}
          className={`${colors[color]} ${sizes[size]}`}
        />
      </div>
    </div>
  );
}
