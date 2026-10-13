import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ScannerEventHeader } from "../../components/scanner/ScannerEventHeader";
import { ScannerApp } from "../../features/scanner/ScannerApp";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { scannerService } from "../../services/scanner.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";

export default function ScannerEventPage() {
  const { eventId } = useParams();
  useSeo({ title: "Scan" });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.scanner.event(eventId),
    queryFn: () => scannerService.getEventContext(eventId),
    enabled: Boolean(eventId),
  });

  if (isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="py-20 text-center px-4">
        <p className="text-sm text-muted-foreground">
          You don't have scanner access to this event.
        </p>
        <Button className="mt-4" to={ROUTES.scanner.home}>
          Back to assigned events
        </Button>
      </div>
    );
  }

  const { event, attendance } = data.data;

  return (
    <div className="flex flex-col">
      <ScannerEventHeader event={event} attendance={attendance} />
      <ScannerApp eventId={eventId} />
    </div>
  );
}