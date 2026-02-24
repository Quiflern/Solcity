import type { HTMLAttributes, ReactNode } from "react";

/**
 * Badge Component
 *
 * A small label component for displaying status, categories, or metadata.
 * Supports multiple color variants for different semantic meanings.
 *
 * Features:
 * - Four variants: default (gray), accent (lime), success (green), warning (yellow)
 * - Uppercase text with tracking for better readability
 * - Border styling matching the variant color
 * - Extends HTMLSpanElement for full span attributes support
 *
 * @param variant - Color scheme (default: "default")
 * @param children - Badge content
 * @param className - Additional CSS classes
 */

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning";
  children: ReactNode;
}

export default function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-text-secondary border border-border",
    accent: "bg-accent/10 text-accent border border-accent/20",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
