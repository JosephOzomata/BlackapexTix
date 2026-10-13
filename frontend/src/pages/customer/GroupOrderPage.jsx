import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { GroupAttendanceCard } from "../../components/tickets/GroupAttendanceCard";
import { PaymentStatusPanel } from "../../components/payment/PaymentStatusPanel";
import { OrderSummary } from "../../components/payment/OrderSummary";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { ticketsService } from "../../services/tickets.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";

export default function GroupOrderPage() {
  const { orderId } = useParams();
  useSeo({ title: "Group attendance" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.customer.groupOrder(orderId),
    queryFn: () => ticketsService.getGroupOrder(orderId),
    enabled: Boolean(orderId),
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
          We couldn't load this order. You may not have access to it.
        </p>
        <Button className="mt-4" to={ROUTES.myTickets}>Back to My Tickets</Button>
      </div>
    );
  }

  const { order, tickets, summary } = data.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to={ROUTES.myTickets}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to My Tickets
      </Link>

      <PageHeader
        eyebrow="Group order"
        title={order.items?.[0]?.name ?? "Group"}
        subtitle={`${summary.total} attendees · purchased by you`}
      />

      <GroupAttendanceCard tickets={tickets} summary={summary} />

      <PaymentStatusPanel order={order} />

      <OrderSummary
        lines={order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          admits: i.admits,
        }))}
        subtotal={order.subtotal}
        fees={order.fees}
        total={order.total}
        currency={order.currency}
        showFeeNote={false}
      />

      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <Users size={14} className="shrink-0 mt-0.5" />
        Only you, the purchaser, can view this order's aggregate attendance.
        Individual attendees only see their own QR ticket.
      </p>
    </div>
  );
}