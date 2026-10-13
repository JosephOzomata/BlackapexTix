import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Spinner } from "../../components/common/Spinner";
import { EventControlCenter } from "../../features/organizer/EventControlCenter";
import { RevenueChart } from "../../components/charts/RevenueChart";
import { CheckinProgressChart } from "../../components/charts/CheckinProgressChart";
import { CategoryBreakdownChart } from "../../components/charts/CategoryBreakdownChart";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Button } from "../../components/common/Button";
import { organizersService } from "../../services/organizers.service";
import { eventsService } from "../../services/events.service";
import { analyticsService } from "../../services/analytics.service";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { queryKeys } from "../../queryClient";
import { ROUTES } from "../../constants/routes";

export default function OrganizerEventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState(null);

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const event = useQuery({
    queryKey: queryKeys.organizer.event(eventId),
    queryFn: () => eventsService.getOrganizerEvent(organizerId, eventId),
    enabled: Boolean(organizerId && eventId),
  });

  const analytics = useQuery({
    queryKey: queryKeys.organizer.analytics(eventId, 30),
    queryFn: () => analyticsService.eventAnalytics(organizerId, eventId, { days: 30 }),
    enabled: Boolean(organizerId && eventId),
  });

  const publish = useMutation({
    mutationFn: () => eventsService.publishEvent(organizerId, eventId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Event published");
        queryClient.invalidateQueries({ queryKey: queryKeys.organizer.event(eventId) });
      } else {
        toast.error(res.message);
      }
    },
  });

  const duplicate = useMutation({
    mutationFn: () => eventsService.duplicateEvent(organizerId, eventId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Event duplicated");
        navigate(ROUTES.organizer.eventDetail(res.data.id));
      }
    },
  });

  const cancel = useMutation({
    mutationFn: (reason) => eventsService.cancelEvent(organizerId, eventId, reason),
    onSuccess: () => {
      toast.success("Event cancelled");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.event(eventId) });
      setConfirmAction(null);
    },
  });

  const deleteDraft = useMutation({
    mutationFn: () => eventsService.deleteDraft(organizerId, eventId),
    onSuccess: () => {
      toast.success("Draft deleted");
      navigate(ROUTES.organizer.events);
    },
  });

  if (event.isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (event.isError || !event.data?.success) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">Event not found.</p>
        <Button className="mt-4" to={ROUTES.organizer.events}>
          Back to my events
        </Button>
      </div>
    );
  }

  const ev = event.data.data;
  const a = analytics.data?.data ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Event"
        title={ev.title}
        subtitle="Manage this event's tickets, attendees, scanners, and revenue."
      />

      <EventControlCenter
        event={ev}
        onPublish={() => publish.mutate()}
        onDuplicate={() => duplicate.mutate()}
        onCancel={() => setConfirmAction("cancel")}
        onDelete={() => setConfirmAction("delete")}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <RevenueChart data={a.revenue ?? []} loading={analytics.isLoading} />
        <CategoryBreakdownChart
          categories={a.categories ?? []}
          loading={analytics.isLoading}
        />
        <CheckinProgressChart checkin={a.checkin} />
      </div>

      <ConfirmDialog
        open={confirmAction === "cancel"}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => cancel.mutate("Cancelled by organizer")}
        title="Cancel this event?"
        description="All ticket holders will be notified and refunds can be processed."
        confirmLabel="Cancel event"
        loading={cancel.isPending}
      />

      <ConfirmDialog
        open={confirmAction === "delete"}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => deleteDraft.mutate()}
        title="Delete this draft?"
        description="This can't be undone."
        confirmLabel="Delete draft"
        loading={deleteDraft.isPending}
      />
    </div>
  );
}