import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../utils/cn";

export function StatCard({
  label,
  value,
  icon,
  delta,
  deltaLabel,
  tone = "primary",
  className,
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
    info: "text-info bg-info/10",
    neutral: "text-muted-foreground bg-card-elevated",
  }[tone];

  const showDelta = delta != null && Number.isFinite(Number(delta));
  const deltaUp = showDelta && Number(delta) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-foreground tabular-nums tracking-tight">
            {value}
          </p>
          {showDelta && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium inline-flex items-center gap-1",
                deltaUp ? "text-success" : "text-danger"
              )}
            >
              {deltaUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {deltaUp ? "+" : ""}
              {delta}% {deltaLabel ?? "vs last period"}
            </p>
          )}
        </div>
        {icon && (
          <span className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", toneClass)}>
            {icon}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;