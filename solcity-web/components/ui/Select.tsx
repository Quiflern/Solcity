import type { SelectHTMLAttributes } from "react";

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
        className={`bg-panel border border-border px-4 py-3 rounded-lg text-text-primary text-sm transition-colors focus:outline-none focus:border-accent cursor-pointer ${error ? "border-red-500" : ""
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
