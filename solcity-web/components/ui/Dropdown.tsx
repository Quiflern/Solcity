"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Dropdown Component
 *
 * A custom dropdown/select component with animations and icon support.
 * Provides better styling and UX than native select elements.
 *
 * Features:
 * - Custom styled dropdown with animations
 * - Optional icons for each option
 * - Animated chevron rotation
 * - Click-outside detection to close
 * - Selected state with checkmark
 * - Error state styling
 * - Keyboard accessible
 * - Scrollable options list (max 60vh)
 *
 * @param label - Optional label text
 * @param options - Array of dropdown options with value, label, and optional icon
 * @param value - Currently selected value
 * @param onChange - Callback when selection changes
 * @param placeholder - Text shown when no option selected
 * @param error - Error message to display
 * @param className - Additional CSS classes
 */

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label?: string;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-panel border px-4 py-3 text-text-primary text-sm transition-colors focus:outline-none cursor-pointer flex items-center justify-between ${
            error
              ? "border-red-500"
              : "border-border hover:border-accent focus:border-accent focus:ring-2 focus:ring-accent/50"
          }`}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-panel border border-border shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${
                    selectedValue === option.value
                      ? "bg-accent/10 text-accent"
                      : "text-text-primary hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {selectedValue === option.value && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
