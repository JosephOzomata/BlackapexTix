import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

const STEPS = [
  { key: "review", label: "Review" },
  { key: "auth", label: "Sign in" },
  { key: "payment", label: "Payment" },
  { key: "done", label: "Tickets" },
];

export function CheckoutSteps({ current = "review" }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={s.key} className="flex-1 flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  done
                    ? "bg-success text-white"
                    : active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card-elevated text-muted-foreground"
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "flex-1 h-px mx-1 min-w-4",
                    done ? "bg-success" : "bg-border"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default CheckoutSteps;