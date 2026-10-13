import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { TransactionsTable } from "../../features/organizer/TransactionsTable";
import { organizersService } from "../../services/organizers.service";
import { analyticsService } from "../../services/analytics.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";

export default function OrganizerTransactionsPage() {
  useSeo({ title: "Transactions" });

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.organizer.dashboard, "transactions"],
    queryFn: () => analyticsService.organizerOverview(organizerId),
    enabled: Boolean(organizerId),
  });

  const transactions = data?.data?.recentTransactions ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Payments, refunds, and settlement records."
      />
      <TransactionsTable transactions={transactions} loading={isLoading} />
    </div>
  );
}