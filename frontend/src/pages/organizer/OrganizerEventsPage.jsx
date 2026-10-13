import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, CalendarDays } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Tabs } from "../../components/common/Tabs";
import { EventGrid } from "../../components/events/EventGrid";
import { EmptyState } from "../../components/common/EmptyState";
import { organizersService } from "../../services/organizers.service";
import { eventsService } from "../../services/events.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";

const TABS = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "SALES_LIVE", label: "Live" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SOLD_OUT", label: "Sold out" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrganizerEventsPage() {
  useSeo({ title: "My Events" });
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.organizer.events({ status, q }),
    queryFn: () => eventsService.getOrganizerEvents(organizerId, { status, q }),
    enabled: Boolean(organizerId),
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Events"
        subtitle="Manage, edit, and monitor every event you've created."
        actions={
          <Button to={ROUTES.organizer.eventNew} leftIcon={<Plus size={16} />}>
            Create event
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search events by title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={14} />}
          containerClassName="sm:max-w-md"
        />
      </div>

      <Tabs value={status} onChange={setStatus} items={TABS} />

      {isLoading ? (
        <EventGrid loading columns={3} events={[]} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={26} />}
          title={status || q ? "No events match" : "No events yet"}
          description={
            status || q
              ? "Try a different filter or search term."
              : "Create your first event and start selling tickets."
          }
          action={
            <Button to={ROUTES.organizer.eventNew} leftIcon={<Plus size={14} />}>
              Create event
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <Link
              key={e.id}
              to={ROUTES.organizer.eventDetail(e.id)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 hover:border-border-strong transition-colors"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-card-elevated overflow-hidden shrink-0">
                {e.media?.[0]?.url && (
                  <img src={e.media[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {e.title}
                  </span>
                  <StatusBadge kind="event" status={e.status} size="sm" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {new Date(e.startAt).toLocaleDateString("en-NG", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                  })}{" "}
                  · {e.city}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {e.stats?.sold ?? 0} / {e.stats?.capacity ?? 0} sold
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}