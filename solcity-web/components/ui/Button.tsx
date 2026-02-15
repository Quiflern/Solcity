"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold transition-all inline-flex items-center justify-center gap-2 relative overflow-hidden hover:opacity-80 active:opacity-60 active:scale-[0.98]";

  const variants = {
    primary: "bg-accent text-black",
    secondary: "bg-panel border border-border text-text-primary after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:border-accent hover:bg-[#1a1a1a]",
    outline: "border border-border bg-transparent text-text-primary after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:border-accent hover:bg-accent/5",
    ghost: "bg-transparent text-text-secondary after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:text-accent hover:bg-accent/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-10 py-4 text-base",
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </button>
  );
}
