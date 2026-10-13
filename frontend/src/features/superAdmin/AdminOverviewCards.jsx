import {
  Wallet, Users, Calendar, Building2, Receipt, ShieldCheck,
} from "lucide-react";
import { StatCard } from "../../components/common/StatCard";
import { formatCurrency } from "../../utils/currency";

export function AdminOverviewCards({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }
  const cards = [
    { label: "Gross revenue", value: formatCurrency(stats.grossRevenue ?? 0, "NGN"), icon: <Wallet size={18} />, tone: "primary" },
    { label: "Platform revenue", value: formatCurrency(stats.platformRevenue ?? 0, "NGN"), icon: <ShieldCheck size={18} />, tone: "success" },
    { label: "Organizers", value: (stats.organizers ?? 0).toLocaleString(), icon: <Building2 size={18} />, tone: "info" },
    { label: "Users", value: (stats.users ?? 0).toLocaleString(), icon: <Users size={18} />, tone: "accent" },
    { label: "Events", value: (stats.events ?? 0).toLocaleString(), icon: <Calendar size={18} />, tone: "neutral" },
    { label: "Transactions", value: (stats.transactions ?? 0).toLocaleString(), icon: <Receipt size={18} />, tone: "primary" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}

export default AdminOverviewCards;