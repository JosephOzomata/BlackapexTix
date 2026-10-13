import { Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, Users, Building2, Receipt, ShieldAlert,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const ITEMS = [
  { to: ROUTES.admin.dashboard, label: "Overview", icon: <LayoutDashboard size={18} />, end: true },
  { to: ROUTES.admin.events, label: "Events", icon: <CalendarDays size={18} /> },
  { to: ROUTES.admin.organizers, label: "Organizers", icon: <Building2 size={18} /> },
  { to: ROUTES.admin.users, label: "Users", icon: <Users size={18} /> },
  { to: ROUTES.admin.transactions, label: "Transactions", icon: <Receipt size={18} /> },
  { to: ROUTES.admin.moderation, label: "Moderation", icon: <ShieldAlert size={18} /> },
];

export default function AdminLayout() {
  const brand = (
    <Link to={ROUTES.admin.dashboard} className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-lg bg-danger flex items-center justify-center">
        <ShieldAlert size={16} className="text-white" />
      </span>
      <span className="font-semibold text-sm">Super Admin</span>
    </Link>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <Sidebar items={ITEMS} brand={brand} />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}