"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2"
    >
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          className={`bg-panel border ${error ? "border-red-500" : "border-border"
            } ${icon ? "pl-10" : "px-4"} py-3 text-text-primary text-sm transition-colors focus:outline-none focus:border-accent w-full ${className}`}
          {...props}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          >
            <AlertCircle className="w-4 h-4" />
          </motion.div>
        )}
      </div>
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 flex items-center gap-1"
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  );
}
