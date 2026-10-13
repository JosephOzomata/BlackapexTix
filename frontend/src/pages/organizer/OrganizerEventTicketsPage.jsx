import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { organizersService } from "../../services/organizers.service";
import { eventsService } from "../../services/events.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { formatCurrency } from "../../utils/currency";
import { Badge } from "../../components/common/Badge";
import { Edit3 } from "lucide-react";

export default function OrganizerEventTicketsPage() {
  const { eventId } = useParams();
  useSeo({ title: "Manage Tickets" });

  const profile = useQuery({
    queryKey: ["organizer", "me"],
    queryFn: () => organizersService.getMyProfile(),
  });
  const organizerId = profile.data?.data?.organizer?.id;

  const tickets = useQuery({
    queryKey: [...queryKeys.organizer.event(eventId), "ticket-types"],
    queryFn: () => eventsService.getTicketTypes(organizerId, eventId),
    enabled: Boolean(organizerId && eventId),
  });

  const event = useQuery({
    queryKey: queryKeys.organizer.event(eventId),
    queryFn: () => eventsService.getOrganizerEvent(organizerId, eventId),
    enabled: Boolean(organizerId && eventId),
  });

  if (tickets.isLoading || event.isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = tickets.data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={event.data?.data?.title}
        title="Ticket categories"
        subtitle="Capacity, pricing, and availability per category."
        actions={
          <Button
            to={ROUTES.organizer.eventEdit(eventId)}
            variant="outline"
            leftIcon={<Edit3 size={14} />}
          >
            Edit in wizard
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => {
          const sold = t.availability?.quantitySold ?? 0;
          const total = t.availability?.quantityAvailable ?? t.quantityTotal;
          const pct = total ? Math.round((sold / total) * 100) : 0;

          return (
            <div
              key={t.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground truncate">
                    {t.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.admits > 1 ? `Admits ${t.admits} · ` : ""}
                    {t.isVisible ? "Visible" : "Hidden"}
                  </p>
                </div>
                <Badge tone={sold >= total ? "danger" : "success"} size="sm">
                  {sold >= total ? "Sold out" : "Live"}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-extrabold text-foreground tabular-nums">
                  {formatCurrency(t.price, t.currency)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sold</span>
                  <span className="tabular-nums">{sold} / {total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-card-elevated overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-subtle">
                  {total - sold} remaining
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}