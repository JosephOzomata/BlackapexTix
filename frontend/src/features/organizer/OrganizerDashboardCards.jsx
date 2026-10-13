import {
  Wallet, TrendingUp, Users, Ticket, Activity, CalendarCheck, BadgeCheck, Clock,
} from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { formatCurrency } from "../../utils/currency";

export function OrganizerDashboardCards({ stats, currency = "NGN", loading }) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Net revenue",
      value: formatCurrency(stats.netRevenue ?? 0, currency),
      icon: <Wallet size={18} />,
      tone: "primary",
    },
    {
      label: "Tickets sold",
      value: (stats.ticketsSold ?? 0).toLocaleString(),
      icon: <Ticket size={18} />,
      tone: "info",
    },
    {
      label: "Checked in",
      value: (stats.checkedIn ?? 0).toLocaleString(),
      icon: <BadgeCheck size={18} />,
      tone: "success",
    },
    {
      label: "Active events",
      value: (stats.activeEvents ?? 0).toLocaleString(),
      icon: <Activity size={18} />,
      tone: "accent",
    },
    {
      label: "Upcoming events",
      value: (stats.upcomingEvents ?? 0).toLocaleString(),
      icon: <CalendarCheck size={18} />,
      tone: "neutral",
    },
    {
      label: "Completed events",
      value: (stats.completedEvents ?? 0).toLocaleString(),
      icon: <Clock size={18} />,
      tone: "neutral",
    },
    {
      label: "Gross revenue",
      value: formatCurrency(stats.grossRevenue ?? 0, currency),
      icon: <TrendingUp size={18} />,
      tone: "info",
    },
    {
      label: "Total events",
      value: (stats.totalEvents ?? 0).toLocaleString(),
      icon: <Users size={18} />,
      tone: "neutral",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}

export default OrganizerDashboardCards;