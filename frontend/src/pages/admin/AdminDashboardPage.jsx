import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { AdminOverviewCards } from "../../features/superAdmin/AdminOverviewCards";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { AdminTransactionsTable } from "../../features/superAdmin/AdminTransactionsTable";
import { Card, CardBody, CardHeader } from "../../components/common/Card";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { formatCurrency } from "../../utils/currency";

export default function AdminDashboardPage() {
  useSeo({ title: "Admin Overview" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: () => adminService.getOverview(),
  });

  const stats = data?.data?.stats;
  const series = data?.data?.series ?? [];
  const topOrganizers = data?.data?.topOrganizers ?? [];
  const recentTx = data?.data?.recentTransactions ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin"
        title="Platform overview"
        subtitle="Revenue, organizers, and activity across TicketHub."
      />

      <AdminOverviewCards stats={stats} loading={isLoading} />

      <RevenueChart data={series} loading={isLoading} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Top organizers"
            subtitle="By gross revenue"
            actions={
              <Link
                to={ROUTES.admin.organizers}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                All organizers <ArrowRight size={12} />
              </Link>
            }
          />
          <CardBody>
            {topOrganizers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No organizer data yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {topOrganizers.map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {o.businessName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.ticketsSold ?? 0} tickets
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      {formatCurrency(o.grossRevenue ?? 0, "NGN")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent transactions"
            subtitle="Latest activity"
            actions={
              <Link
                to={ROUTES.admin.transactions}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            }
          />
          <CardBody className="pt-0">
            <AdminTransactionsTable items={recentTx.slice(0, 5)} loading={isLoading} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}