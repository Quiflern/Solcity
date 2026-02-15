import type { InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export default function Toggle({
  label,
  description,
  className = "",
  disabled,
  ...props
}: ToggleProps) {
  return (
    <div className={`flex items-center justify-between ${disabled ? "opacity-40" : ""} ${className}`}>
      {(label || description) && (
        <div className="flex-1">
          {label && <div className="text-base font-medium mb-1">{label}</div>}
          {description && (
            <div className="text-sm text-text-secondary">{description}</div>
          )}
        </div>
      )}
      <label className={`relative inline-block w-11 h-[22px] ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input type="checkbox" className="opacity-0 w-0 h-0 peer" disabled={disabled} {...props} />
        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#333] transition-all duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:transition-all before:duration-300 peer-checked:bg-accent peer-checked:before:translate-x-[22px] peer-checked:before:bg-black" />
      </label>
    </div>
  );
}
