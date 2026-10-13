import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { Spinner } from "../../components/common/Spinner";
import { EventCreationWizard } from "../../features/events/EventCreationWizard";
import { organizersService } from "../../services/organizers.service";
import { eventsService } from "../../services/events.service";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { queryKeys } from "../../queryClient";
import { ROUTES } from "../../constants/routes";

export default function OrganizerEventEditPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  useSeo({ title: "Edit Event" });

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

  const update = useMutation({
    mutationFn: (values) => eventsService.updateEvent(organizerId, eventId, values),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Event updated");
        queryClient.invalidateQueries({ queryKey: queryKeys.organizer.event(eventId) });
        navigate(ROUTES.organizer.eventDetail(eventId));
      } else {
        toast.error(res.message);
      }
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
      </div>
    );
  }

  const ev = event.data.data;

  const initialValues = {
    ...ev,
    ticketTypes: (ev.ticketTypes ?? []).map((t) => ({
      ...t,
      price: t.price / 100, // back to major units for the form
    })),
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        eyebrow="Edit event"
        title={ev.title}
        subtitle="Update details, tickets, and theme. Changes are saved per step."
      />

      <EventCreationWizard
        mode="edit"
        initialValues={initialValues}
        onSubmit={(values) => update.mutate(values)}
      />
    </div>
  );
}