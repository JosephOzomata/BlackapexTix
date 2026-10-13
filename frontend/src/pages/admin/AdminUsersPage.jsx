import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Users, ShieldOff, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { useToast } from "../../hooks/useToast";
import { formatDateTime } from "../../utils/dates";
import { ROLES } from "../../constants/roles";

const ROLE_TONE = {
  SUPER_ADMIN: "danger",
  ORGANIZER: "primary",
  SCANNER: "info",
  CUSTOMER: "neutral",
};

export default function AdminUsersPage() {
  useSeo({ title: "Users" });
  const toast = useToast();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users({ q, role }),
    queryFn: () => adminService.getUsers({ q, role }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ userId, status }) => adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users({ q, role }) });
      setConfirm(null);
    },
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="All accounts across the platform." />

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={14} />}
          containerClassName="sm:max-w-md"
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "", label: "All roles" },
            { value: ROLES.SUPER_ADMIN, label: "Super Admin" },
            { value: ROLES.ORGANIZER, label: "Organizer" },
            { value: ROLES.SCANNER, label: "Scanner" },
            { value: ROLES.CUSTOMER, label: "Customer" },
          ]}
          containerClassName="sm:w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Users size={26} />} title="No users found" />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card-elevated/50 text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold">User</th>
                  <th className="hidden md:table-cell px-4 py-3 text-[10px] uppercase tracking-wider font-bold">Role</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-[10px] uppercase tracking-wider font-bold">Joined</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold">Status</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-card-elevated/40">
                    <td className="px-4 py-3 align-middle">
                      <div className="font-medium text-foreground truncate">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <Badge tone={ROLE_TONE[u.role] ?? "neutral"} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(u.createdAt, "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          u.status === "ACTIVE"
                            ? "success"
                            : u.status === "SUSPENDED"
                            ? "danger"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== ROLES.SUPER_ADMIN && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={u.status === "ACTIVE" ? "text-danger" : "text-success"}
                          leftIcon={
                            u.status === "ACTIVE" ? (
                              <ShieldOff size={12} />
                            ) : (
                              <ShieldCheck size={12} />
                            )
                          }
                          onClick={() =>
                            setConfirm({
                              userId: u.id,
                              name: u.fullName,
                              next: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                            })
                          }
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() =>
          updateStatus.mutate({ userId: confirm.userId, status: confirm.next })
        }
        title={`${confirm?.next === "SUSPENDED" ? "Suspend" : "Activate"} this user?`}
        description={
          confirm?.next === "SUSPENDED"
            ? `${confirm?.name} will lose access to their account.`
            : `${confirm?.name} will regain full access.`
        }
        confirmLabel={confirm?.next === "SUSPENDED" ? "Suspend" : "Activate"}
        tone={confirm?.next === "SUSPENDED" ? "danger" : "success"}
        loading={updateStatus.isPending}
      />
    </div>
  );
}