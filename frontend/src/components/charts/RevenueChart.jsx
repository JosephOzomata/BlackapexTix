import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer, chartTooltipStyle, axisProps } from "./ChartContainer";
import { formatCurrency, compactNumber } from "../../utils/currency";
import { format, parseISO } from "date-fns";

export function RevenueChart({ data = [], currency = "NGN", height = 260, loading }) {
  const chartData = data.map((d) => ({
    ...d,
    revenueMajor: d.revenue / 100,
    label: d.date ? format(parseISO(d.date), "d MMM") : "",
  }));

  return (
    <ChartContainer
      title="Revenue"
      subtitle="Confirmed ticket sales over the period"
      height={height}
    >
      {loading ? (
        <div className="skeleton h-full rounded-xl" />
      ) : chartData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No revenue recorded yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              {...axisProps}
              tickFormatter={(v) => compactNumber(v)}
              width={44}
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(v) => formatCurrency(v, currency)}
            />
            <Area
              type="monotone"
              dataKey="revenueMajor"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}

export default RevenueChart;