"use client";

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-panel border border-border p-6 relative overflow-hidden transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-0 after:-left-full after:w-full after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(208,255,20,0.1),transparent)] after:transition-all after:duration-500 hover:after:left-full hover:bg-[#1a1a1a] hover:border-accent ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
