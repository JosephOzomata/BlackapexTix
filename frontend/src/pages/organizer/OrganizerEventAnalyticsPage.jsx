import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { TicketSalesChart } from "../../components/charts/TicketSalesChart";
import { CategoryBreakdownChart } from "../../components/charts/CategoryBreakdownChart";
import { CheckinProgressChart } from "../../components/charts/CheckinProgressChart";
import { organizersService } from "../../services/organizers.service";
import { analyticsService } from "../../services/analytics.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";

export default function OrganizerEventAnalyticsPage() {
  const { eventId } = useParams();
  useSeo({ title: "Analytics" });

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.organizer.analytics(eventId, 30),
    queryFn: () => analyticsService.eventAnalytics(organizerId, eventId, { days: 30 }),
    enabled: Boolean(organizerId && eventId),
  });

  const a = data?.data ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Revenue, sales, and attendance over the last 30 days."
      />

      <CheckinProgressChart checkin={a.checkin} />

      <div className="grid gap-5 lg:grid-cols-2">
        <RevenueChart data={a.revenue ?? []} loading={isLoading} />
        <TicketSalesChart data={a.revenue ?? []} loading={isLoading} />
      </div>

      <CategoryBreakdownChart categories={a.categories ?? []} loading={isLoading} />
    </div>
  );
}