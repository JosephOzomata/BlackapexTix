import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function CheckinProgressChart({ checkin, className }) {
  if (!checkin) return null;
  const { total = 0, checkedIn = 0, remaining = 0, rate = 0 } = checkin;
  const pct = Math.round(rate * 100);

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Check-in progress</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live door attendance
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold tabular-nums text-foreground">{pct}%</div>
        </div>
      </header>

      <div className="relative h-3 rounded-full bg-card-elevated overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Checked in" value={checkedIn} />
        <Stat label="Remaining" value={remaining} />
        <Stat label="Total" value={total} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );
}

export default CheckinProgressChart;