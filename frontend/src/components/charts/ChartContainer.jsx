import { cn } from "../../utils/cn";

export function ChartContainer({ title, subtitle, actions, children, className, height = 260 }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  );
}

/** Shared tooltip styling for Recharts. */
export const chartTooltipStyle = {
  contentStyle: {
    background: "var(--color-card-elevated)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "12px",
    padding: "8px 12px",
    boxShadow: "var(--shadow-lg)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: "11px", marginBottom: "4px" },
  itemStyle: { color: "var(--color-foreground)" },
};

export const axisProps = {
  stroke: "var(--color-muted)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export default ChartContainer;