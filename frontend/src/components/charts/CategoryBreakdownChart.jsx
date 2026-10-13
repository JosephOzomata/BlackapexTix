import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, chartTooltipStyle } from "./ChartContainer";
import { formatCurrency } from "../../utils/currency";

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

export function CategoryBreakdownChart({ categories = [], currency = "NGN", height = 260, loading }) {
  const chartData = categories.map((c) => ({
    name: c.name,
    value: c.revenue,
    sold: c.sold,
  }));

  const totalRevenue = chartData.reduce((s, c) => s + c.value, 0);

  return (
    <ChartContainer
      title="By ticket category"
      subtitle="Revenue distribution"
      height={height}
    >
      {loading ? (
        <div className="skeleton h-full rounded-xl" />
      ) : chartData.length === 0 || totalRevenue === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No sales data yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="var(--color-card)"
              strokeWidth={2}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              {...chartTooltipStyle}
              formatter={(v) => formatCurrency(v, currency)}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
}

export default CategoryBreakdownChart;