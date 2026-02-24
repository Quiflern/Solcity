import type { SelectHTMLAttributes } from "react";

/**
 * Select Component
 *
 * A styled native select dropdown component with label and error state support.
 * Simpler alternative to the custom Dropdown component for basic use cases.
 *
 * Features:
 * - Optional label above select
 * - Error state with red border
 * - Error message display below select
 * - Focus state with accent border
 * - Extends HTMLSelectElement for full select attributes support
 *
 * @param label - Optional label text
 * @param error - Error message to display
 * @param options - Array of options with value and label
 * @param className - Additional CSS classes
 */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <select
        className={`bg-panel border border-border px-4 py-3 rounded-lg text-text-primary text-sm transition-colors focus:outline-none focus:border-accent cursor-pointer ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
