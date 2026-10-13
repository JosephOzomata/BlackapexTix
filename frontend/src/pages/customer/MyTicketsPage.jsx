import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/layout/PageHeader";
import { MyTicketsTabs } from "../../features/tickets/MyTicketsTabs";
import { MyTicketList } from "../../features/tickets/MyTicketList";
import { ticketsService } from "../../services/tickets.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { Button } from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";

export default function MyTicketsPage() {
  useSeo({ title: "My Tickets" });
  const [scope, setScope] = useState("upcoming");

  const query = useQuery({
    queryKey: queryKeys.customer.tickets(scope),
    queryFn: () => ticketsService.getMyTickets(scope === "all" ? {} : { scope }),
  });

  const items = query.data?.data?.items ?? [];
  const counts = {
    upcoming: items.filter((t) => new Date(t.event?.startAt) > new Date()).length,
    past: items.filter((t) => new Date(t.event?.startAt) <= new Date()).length,
    all: items.length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tickets"
        subtitle="Your QR passes for every event — one code per person."
        actions={
          <Button to={ROUTES.events} variant="outline">
            Explore more events
          </Button>
        }
      />

      <MyTicketsTabs value={scope} onChange={setScope} counts={counts} />

      {query.isError ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">We couldn't load your tickets.</p>
          <Button className="mt-4" onClick={() => query.refetch()}>Try again</Button>
        </div>
      ) : (
        <MyTicketList
          tickets={items}
          emptyVariant={scope}
        />
      )}
    </div>
  );
}