"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`bg-panel border border-border p-10 relative ${sizes[size]} w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
