import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer, chartTooltipStyle, axisProps } from "./ChartContainer";
import { format, parseISO } from "date-fns";

export function TicketSalesChart({ data = [], height = 260, loading }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.date ? format(parseISO(d.date), "d MMM") : "",
  }));

  return (
    <ChartContainer
      title="Tickets sold"
      subtitle="Daily volume across the period"
      height={height}
    >
      {loading ? (
        <div className="skeleton h-full rounded-xl" />
      ) : chartData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No tickets sold yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={36} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="tickets" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}

export default TicketSalesChart;