import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { AdminOrganizersTable } from "../../features/superAdmin/AdminOrganizersTable";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { useToast } from "../../hooks/useToast";

export default function AdminOrganizersPage() {
  useSeo({ title: "Organizers" });
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.organizers({}),
    queryFn: () => adminService.getOrganizers({}),
  });

  const updateStatus = useMutation({
    mutationFn: ({ organizerId, status }) =>
      adminService.updateOrganizerStatus(organizerId, status),
    onSuccess: () => {
      toast.success("Organizer updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.organizers({}) });
    },
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizers"
        subtitle="Approve, verify, or suspend organizers on the platform."
      />
      <AdminOrganizersTable
        items={items}
        loading={isLoading}
        onStatusChange={(payload) => updateStatus.mutate(payload)}
      />
    </div>
  );
}