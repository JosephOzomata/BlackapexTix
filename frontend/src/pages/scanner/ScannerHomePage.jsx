import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { ScannerEventsList } from "../../features/scanner/ScannerEventsList";
import { ScannerNetworkStatus } from "../../components/scanner/ScannerNetworkStatus";
import { Button } from "../../components/common/Button";
import { scannerService } from "../../services/scanner.service";
import { useAuth } from "../../hooks/useAuth";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { useToast } from "../../hooks/useToast";

export default function ScannerHomePage() {
  useSeo({ title: "Scanner" });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.scanner.assignedEvents,
    queryFn: () => scannerService.getAssignedEvents(),
    refetchInterval: 30_000,
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Signed in as {user?.fullName}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Assigned events
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            navigate("/login");
          }}
        >
          Sign out
        </Button>
      </div>

      <ScannerNetworkStatus />

      <ScannerEventsList items={items} loading={isLoading} />

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <ScanLine size={28} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Waiting for an organizer to assign you to an event.
          </p>
        </div>
      )}
    </div>
  );
}