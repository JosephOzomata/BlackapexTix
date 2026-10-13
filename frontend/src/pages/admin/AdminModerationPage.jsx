import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Flag, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/common/Badge";
import { adminService } from "../../services/admin.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { formatDateTime } from "../../utils/dates";

export default function AdminModerationPage() {
  useSeo({ title: "Moderation" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.events({ status: "PENDING_REVIEW" }),
    queryFn: () => adminService.getEvents({}),
  });

  const flagged = (data?.data?.items ?? []).filter(
    (e) => e.status === "UNPUBLISHED" || e.status === "CANCELLED"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trust & Safety"
        title="Moderation"
        subtitle="Review flagged events and platform activity."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-lg bg-warning/15 text-warning flex items-center justify-center">
              <Flag size={20} />
            </span>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">0</div>
              <p className="text-xs text-muted-foreground">Open reports</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-lg bg-danger/15 text-danger flex items-center justify-center">
              <AlertTriangle size={20} />
            </span>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">
                {flagged.length}
              </div>
              <p className="text-xs text-muted-foreground">Flagged events</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <ShieldAlert size={20} />
            </span>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">0</div>
              <p className="text-xs text-muted-foreground">Pending refunds</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Flagged events"
          subtitle="Events that need attention"
        />
        <CardBody className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-14 rounded-md" />
              ))}
            </div>
          ) : flagged.length === 0 ? (
            <EmptyState
              icon={<ShieldAlert size={26} />}
              title="Nothing to moderate"
              description="No events are currently flagged for review."
              size="sm"
            />
          ) : (
            <ul className="divide-y divide-border">
              {flagged.map((e) => (
                <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(e.updatedAt, "d MMM yyyy · h:mm a")}
                    </p>
                  </div>
                  <Badge tone={e.status === "CANCELLED" ? "danger" : "warning"} size="sm">
                    {e.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}