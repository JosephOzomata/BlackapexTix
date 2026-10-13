import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 10,
  size = "md",
  disabled = false,
  ariaLabel = "Quantity",
}) {
  const s = size === "lg"
    ? { wrap: "h-12", btn: "h-12 w-12", val: "text-lg" }
    : { wrap: "h-10", btn: "h-10 w-10", val: "text-sm" };

  const set = (n) => {
    if (disabled) return;
    const next = Math.max(min, Math.min(max, n));
    if (next !== value) onChange?.(next);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-card overflow-hidden",
        s.wrap,
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => set(value - 1)}
        className={cn(
          "flex items-center justify-center text-foreground hover:bg-card-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          s.btn
        )}
      >
        <Minus size={14} />
      </button>
      <span
        className={cn(
          "min-w-10 px-3 text-center font-semibold tabular-nums text-foreground select-none",
          s.val
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => set(value + 1)}
        className={cn(
          "flex items-center justify-center text-foreground hover:bg-card-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          s.btn
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default QuantityStepper;