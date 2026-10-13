import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { TicketDetailCard } from "../../components/tickets/TicketDetailCard";
import { PaymentStatusPanel } from "../../components/payment/PaymentStatusPanel";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { ticketsService } from "../../services/tickets.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  useSeo({ title: "Ticket" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customer.ticket(ticketId),
    queryFn: () => ticketsService.getTicket(ticketId),
    enabled: Boolean(ticketId),
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
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn't find this ticket.
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <Button to={ROUTES.myTickets} variant="outline">Back to My Tickets</Button>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  const ticket = data.data;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        to={ROUTES.myTickets}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to My Tickets
      </Link>

      <PageHeader
        title={ticket.event?.title ?? "Ticket"}
        subtitle={ticket.ticketType?.name}
      />

      <TicketDetailCard ticket={ticket} />

      <PaymentStatusPanel
        order={{
          paymentStatus:
            ticket.status === "VALID" || ticket.status === "CHECKED_IN"
              ? "CONFIRMED"
              : ticket.status === "PENDING_PAYMENT"
              ? "AWAITING_VERIFICATION"
              : ticket.status,
        }}
      />
    </div>
  );
}