import type { InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

export default function Slider({
  label,
  showValue = false,
  valueFormatter,
  className = "",
  ...props
}: SliderProps) {
  const currentValue = Number(props.value || props.defaultValue || 0);
  const min = Number(props.min || 0);
  const max = Number(props.max || 100);
  const percentage = ((currentValue - min) / (max - min)) * 100;
  const displayValue = valueFormatter
    ? valueFormatter(currentValue)
    : currentValue.toString();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[0.75rem] uppercase text-text-secondary tracking-wider">
          {label && <span>{label}</span>}
          {showValue && <span className="text-accent">{displayValue}</span>}
        </div>
      )}
      <div className="relative">
        <div className="w-full h-1 bg-border">
          <div
            className="h-full bg-accent"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          className="absolute top-0 left-0 w-full h-1 bg-transparent outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          {...props}
        />
      </div>
    </div>
  );
}
