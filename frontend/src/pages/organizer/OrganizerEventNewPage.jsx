import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { EventCreationWizard } from "../../features/events/EventCreationWizard";
import { organizersService } from "../../services/organizers.service";
import { eventsService } from "../../services/events.service";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { queryKeys } from "../../queryClient";
import { ROUTES } from "../../constants/routes";

export default function OrganizerEventNewPage() {
  useSeo({ title: "Create Event" });
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [savingDraft, setSavingDraft] = useState(false);

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const create = useMutation({
    mutationFn: async (values) => {
      const res = await eventsService.createEvent(organizerId, values);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (event) => {
      toast.success("Event created!");
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.events({}) });
      navigate(ROUTES.organizer.eventDetail(event.id), { replace: true });
    },
    onError: (e) => toast.error(e.message ?? "Could not create event"),
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        eyebrow="New event"
        title="Create an event"
        subtitle="Fill in the details below. You can save as a draft at any time."
      />

      <EventCreationWizard
        mode="create"
        savingDraft={savingDraft}
        onSubmit={(values) => create.mutate(values)}
      />
    </div>
  );
}