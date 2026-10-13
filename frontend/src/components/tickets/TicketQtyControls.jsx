import { Minus, Plus } from "lucide-react";
import { cn } from "../../utils/cn";

export function TicketQtyControls({
  quantity = 0,
  max = 10,
  min = 0,
  disabled = false,
  onAdd,
  onRemove,
  size = "md",
}) {
  const s = size === "lg"
    ? { btn: "h-10 w-10", val: "min-w-10 text-base" }
    : { btn: "h-8 w-8", val: "min-w-8 text-sm" };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        aria-label="Remove one ticket"
        disabled={disabled || quantity <= min}
        onClick={onRemove}
        className={cn(
          "rounded-md border border-[var(--event-border)] bg-[var(--event-background)] flex items-center justify-center",
          "text-[var(--event-foreground)] hover:bg-[var(--event-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
          s.btn
        )}
      >
        <Minus size={14} />
      </button>
      <span
        className={cn(
          "px-2 text-center font-bold tabular-nums text-[var(--event-foreground)] select-none",
          s.val
        )}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Add one ticket"
        disabled={disabled || quantity >= max}
        onClick={onAdd}
        className={cn(
          "rounded-md border border-[var(--event-primary)] bg-[var(--event-primary)] flex items-center justify-center",
          "text-[var(--event-primary-foreground)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity",
          s.btn
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default TicketQtyControls;