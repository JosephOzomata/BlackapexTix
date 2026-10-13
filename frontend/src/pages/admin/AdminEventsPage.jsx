import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { AdminEventsTable } from "../../features/superAdmin/AdminEventsTable";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { useToast } from "../../hooks/useToast";

export default function AdminEventsPage() {
  useSeo({ title: "Events" });
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.events({}),
    queryFn: () => adminService.getEvents({}),
  });

  const cancel = useMutation({
    mutationFn: ({ eventId, reason }) => adminService.cancelEvent(eventId, reason),
    onSuccess: () => {
      toast.success("Event cancelled");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.events({}) });
    },
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Moderate and monitor every event on the platform."
      />
      <AdminEventsTable
        items={items}
        loading={isLoading}
        onCancel={(eventId, reason) => cancel.mutate({ eventId, reason })}
      />
    </div>
  );
}