import { Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, PlusCircle, Receipt, User,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const ITEMS = [
  { to: ROUTES.organizer.dashboard, label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
  { to: ROUTES.organizer.events, label: "My Events", icon: <CalendarDays size={18} />, end: true },
  { to: ROUTES.organizer.eventNew, label: "Create Event", icon: <PlusCircle size={18} /> },
  { to: ROUTES.organizer.transactions, label: "Transactions", icon: <Receipt size={18} /> },
  { to: ROUTES.organizer.profile, label: "Organizer Profile", icon: <User size={18} /> },
];

export default function OrganizerLayout() {
  const { user } = useAuth();

  const brand = (
    <Link to={ROUTES.organizer.dashboard} className="flex items-center gap-2 min-w-0">
      <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <LayoutDashboard size={16} className="text-white" />
      </span>
      <span className="truncate font-semibold text-sm text-foreground">
        {user?.organizerName ?? "Organizer"}
      </span>
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