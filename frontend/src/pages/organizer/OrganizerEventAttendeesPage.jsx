import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { AttendeesTable } from "../../features/organizer/AttendeesTable";
import { organizersService } from "../../services/organizers.service";
import { ticketsService } from "../../services/tickets.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";

export default function OrganizerEventAttendeesPage() {
  const { eventId } = useParams();
  useSeo({ title: "Attendees" });

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.organizer.attendees(eventId, {}),
    queryFn: () => ticketsService.getEventTickets(organizerId, eventId, {}),
    enabled: Boolean(organizerId && eventId),
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendees"
        subtitle={`${items.length} tickets issued for this event.`}
      />
      <AttendeesTable tickets={items} loading={isLoading} />
    </div>
  );
}