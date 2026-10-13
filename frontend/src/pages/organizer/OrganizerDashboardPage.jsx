import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, CalendarDays, ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { OrganizerDashboardCards } from "../../features/organizer/OrganizerDashboardCards";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { TicketSalesChart } from "../../components/charts/TicketSalesChart";
import { TransactionsTable } from "../../features/organizer/TransactionsTable";
import { analyticsService } from "../../services/analytics.service";
import { organizersService } from "../../services/organizers.service";
import { useAuthStore } from "../../stores/authStore";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { formatCurrency } from "../../utils/currency";
import { StatusBadge } from "../../components/common/StatusBadge";

export default function OrganizerDashboardPage() {
  useSeo({ title: "Organizer Dashboard" });
  const user = useAuthStore((s) => s.user);

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.organizer.dashboard,
    queryFn: () => analyticsService.organizerOverview(organizerId),
    enabled: Boolean(organizerId),
  });

  const stats = data?.data?.stats;
  const series = data?.data?.series ?? [];
  const recentTransactions = data?.data?.recentTransactions ?? [];

  const events = useQuery({
    queryKey: queryKeys.organizer.events({}),
    queryFn: () => import("../../services/events.service").then(({ eventsService }) =>
      eventsService.getOrganizerEvents(organizerId, {})
    ),
    enabled: Boolean(organizerId),
  });

  const upcomingEvents = (events.data?.data?.items ?? [])
    .filter((e) => new Date(e.startAt) > new Date())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Welcome back, ${user?.fullName?.split(" ")[0] ?? "organizer"}`}
        title="Dashboard"
        subtitle="A snapshot of your events, revenue, and attendees."
        actions={
          <Button to={ROUTES.organizer.eventNew} leftIcon={<Plus size={16} />}>
            Create event
          </Button>
        }
      />

      <OrganizerDashboardCards stats={stats} loading={isLoading} />

      <div className="grid gap-5 lg:grid-cols-2">
        <RevenueChart data={series} loading={isLoading} />
        <TicketSalesChart data={series} loading={isLoading} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <header className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Upcoming events
              </h3>
            </div>
            <Link
              to={ROUTES.organizer.events}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              See all <ArrowRight size={12} />
            </Link>
          </header>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No upcoming events yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    to={ROUTES.organizer.eventDetail(e.id)}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card-elevated/40 p-3 hover:border-border-strong transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-card-elevated overflow-hidden shrink-0">
                      {e.media?.[0]?.url && (
                        <img src={e.media[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate">
                        {e.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {e.stats?.sold ?? 0} sold ·{" "}
                        {formatCurrency(e.stats?.revenue ?? 0, "NGN")}
                      </div>
                    </div>
                    <StatusBadge kind="event" status={e.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <header className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-semibold text-foreground">
              Recent transactions
            </h3>
            <Link
              to={ROUTES.organizer.transactions}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </header>
          <TransactionsTable
            transactions={recentTransactions}
            loading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}