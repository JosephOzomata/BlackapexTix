import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Receipt, ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Button } from "../../components/common/Button";
import { ordersService } from "../../services/orders.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { formatCurrency } from "../../utils/currency";
import { formatDateTime } from "../../utils/dates";
import { ROUTES } from "../../constants/routes";

export default function OrderHistoryPage() {
  useSeo({ title: "Orders" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.customer.orders,
    queryFn: () => ordersService.getMyOrders(),
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Every purchase you've made on TicketHub."
      />

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Receipt size={26} />}
          title="No orders yet"
          description="Your purchases will appear here."
          action={<Button to={ROUTES.events}>Browse events</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-border-strong transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {order.reference}
                    </span>
                    <StatusBadge kind="order" status={order.status} size="sm" />
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-foreground truncate">
                    {order.event?.title ?? "Event"}
                  </h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(order.createdAt, "d MMM yyyy · h:mm a")} ·{" "}
                    {order.items?.length ?? 0} categor
                    {order.items?.length === 1 ? "y" : "ies"}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-foreground tabular-nums">
                    {formatCurrency(order.total, order.currency)}
                  </div>
                  {order.event?.slug && (
                    <Link
                      to={ROUTES.eventDetail(order.event.slug)}
                      className="text-xs text-primary inline-flex items-center gap-1 mt-1 hover:underline"
                    >
                      Event <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}