import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { ScannersManager } from "../../features/organizer/ScannersManager";
import { organizersService } from "../../services/organizers.service";
import { useSeo } from "../../hooks/useSeo";

export default function OrganizerEventScannersPage() {
  const { eventId } = useParams();
  useSeo({ title: "Manage Scanners" });

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Door staff"
        title="Scanners"
        subtitle="Invite trusted team members to scan tickets at the door for this event."
      />
      {organizerId && (
        <ScannersManager organizerId={organizerId} eventId={eventId} />
      )}
    </div>
  );
}