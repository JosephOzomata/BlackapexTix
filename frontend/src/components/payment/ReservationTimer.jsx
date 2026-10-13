import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatCountdown } from "../../utils/dates";
import { cn } from "../../utils/cn";

/**
 * Countdown for backend-held inventory reservations.
 * When it hits zero the reservation is released server-side; the UI
 * simply communicates the state and lets the caller react.
 */
export function ReservationTimer({ expiresAt, onExpire, className }) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0
  );

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const ms = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(ms);
      if (ms === 0) onExpire?.();
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  const urgent = remaining < 120_000;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border",
        urgent
          ? "border-danger/40 bg-danger/10 text-danger"
          : "border-border bg-card text-muted-foreground"
      )}
    >
      <Clock size={12} />
      Your reservation expires in{" "}
      <span className="tabular-nums font-bold">{formatCountdown(remaining)}</span>
    </div>
  );
}

export default ReservationTimer;