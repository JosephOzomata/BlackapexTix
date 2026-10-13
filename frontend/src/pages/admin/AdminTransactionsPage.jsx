import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { AdminTransactionsTable } from "../../features/superAdmin/AdminTransactionsTable";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";

export default function AdminTransactionsPage() {
  useSeo({ title: "Transactions" });
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.transactions({}),
    queryFn: () => adminService.getTransactions({}),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="Every payment processed by the platform."
      />
      <AdminTransactionsTable
        items={data?.data?.items ?? []}
        loading={isLoading}
      />
    </div>
  );
}