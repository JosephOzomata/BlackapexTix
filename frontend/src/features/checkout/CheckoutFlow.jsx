import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";

import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { PaymentMethodSelector } from "../../components/payment/PaymentMethodSelector";
import { OrderSummary } from "../../components/payment/OrderSummary";
import { ReservationTimer } from "../../components/payment/ReservationTimer";
import { PaymentProcessingState } from "../../components/payment/PaymentProcessingState";
import { PaymentFailedState } from "../../components/payment/PaymentFailedState";
import { OrderReview } from "./OrderReview";
import { CheckoutSteps } from "./CheckoutSteps";
import { TicketQRCode } from "../../components/tickets/TicketQRCode";
import { TicketStatusBadge } from "../../components/tickets/TicketStatusBadge";

import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { eventsService } from "../../services/events.service";
import { ordersService } from "../../services/orders.service";
import { paymentsService } from "../../services/payments.service";
import { notificationsService } from "../../services/notifications.service";
import { queryKeys } from "../../queryClient";
import { ROUTES } from "../../constants/routes";
import { CHECKOUT } from "../../constants/config";
import { addMinutesISO } from "../../utils/dates";

/**
 * Multi-phase checkout.
 *
 * Phases:
 *   review  → user confirms quantities + attendee info
 *   auth    → if not signed in, redirect to login with return
 *   payment → pick method, hit Pay
 *   processing / verifying → frontend NEVER decides success
 *   done    → tickets issued by the simulated backend webhook
 *
 * A successful frontend callback is NOT proof of payment. Only the
 * backend-verified order status is.
 */
export default function CheckoutFlow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const user = useAuthStore((s) => s.user);

  const lines = useCartStore((s) => s.lines);
  const totals = useCartStore((s) => s.getTotals());
  const clearCart = useCartStore((s) => s.clearCart);
  const setEvent = useCartStore((s) => s.setEvent);
  const reservationExpiresAt = useCartStore((s) => s.reservationExpiresAt);
  const setReservation = useCartStore((s) => s.setReservation);

  const [phase, setPhase] = useState("review");
  const [method, setMethod] = useState("card");
  const [orderId, setOrderId] = useState(null);
  const [issuedTickets, setIssuedTickets] = useState([]);
  const [errorCode, setErrorCode] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const orderRef = useRef(null);

  /* Load the event from the URL slug. */
  const { data: eventRes, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => eventsService.getEventBySlug(slug),
    enabled: Boolean(slug),
  });
  const event = eventRes?.data;

  /* Ensure the cart is scoped to this event. */
  useEffect(() => {
    if (!event) return;
    setEvent({
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      eventCurrency: event.ticketTypes?.[0]?.currency ?? "NGN",
    });
  }, [event, setEvent]);

  /* Require auth before payment. */
  useEffect(() => {
    if (!isAuthenticated && phase === "payment") {
      navigate(ROUTES.login, {
        state: { from: `/checkout/${slug}` },
        replace: true,
      });
    }
  }, [isAuthenticated, phase, navigate, slug]);

  /* Redirect home if the cart is empty and there's no active order. */
  useEffect(() => {
    if (!orderId && Object.keys(lines).length === 0) {
      navigate(ROUTES.eventDetail(slug), { replace: true });
    }
  }, [lines, orderId, navigate, slug]);

  const subtotal = totals.subtotal;
  const fees = totals.fees;
  const total = totals.total;
  const currency = totals.currency;

  const summaryLines = useMemo(
    () =>
      Object.values(lines).map((l) => ({
        name: l.name,
        quantity: l.quantity,
        price: l.price,
        admits: l.admits,
      })),
    [lines]
  );

  /* ---- Create the order and set a reservation when entering payment ---- */
  const createOrder = async () => {
    const payload = {
      eventId: event.id,
      lines: Object.values(lines).map((l) => ({
        ticketTypeId: l.ticketTypeId,
        quantity: l.quantity,
        attendees: l.attendees ?? [],
      })),
    };

    const res = await ordersService.createOrder(payload);
    if (!res.success) {
      toast.error(res.message ?? "Could not create order");
      return null;
    }

    const order = res.data;
    setOrderId(order.id);
    orderRef.current = order;

    // Simulate a backend-issued reservation hold.
    setReservation({
      reservationId: order.reference,
      expiresAt: addMinutesISO(CHECKOUT.reservationMinutes),
    });

    return order;
  };

  /* ---- Payment initiation + polling ---- */
  const startPayment = async () => {
    try {
      setErrorCode(null);
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const order = await createOrder();
        if (!order) return;
        currentOrderId = order.id;
      }

      const init = await paymentsService.initializeCheckout({
        orderId: currentOrderId,
        method,
      });
      if (!init.success) {
        setErrorCode(init.code ?? "PAYMENT_PROVIDER_ERROR");
        setPhase("failed");
        return;
      }

      setPhase("processing");

      const polled = await paymentsService.pollUntilResolved(currentOrderId, {
        timeoutMs: 30_000,
        onTick: (res) => {
          if (!res.success) return;
          const s = res.data.paymentStatus;
          if (s === "AWAITING_VERIFICATION" || s === "PROCESSING") {
            setVerifying(true);
          }
        },
      });

      if (polled.success && polled.data.fulfilled) {
        setIssuedTickets(polled.data.tickets ?? []);
        notificationsService
          .sendTicketEmail({ orderId: currentOrderId, email: user?.email })
          .catch(() => {});
        setPhase("done");
        clearCart();
        return;
      }

      if (!polled.success) {
        setErrorCode(polled.code ?? "PAYMENT_VERIFICATION_DELAYED");
      } else {
        setErrorCode(polled.data.paymentStatus ?? "PAYMENT_FAILED");
      }
      setPhase("failed");
    } catch {
      setErrorCode("UNKNOWN");
      setPhase("failed");
    }
  };

  const retry = () => {
    setErrorCode(null);
    setPhase("payment");
  };

  /* ---- Loading/error guards ---- */
  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="skeleton h-64 w-full max-w-2xl rounded-2xl" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn't load this event for checkout.
        </p>
        <Button className="mt-4" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(ROUTES.eventDetail(event.slug))}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to event
      </button>

      <PageHeader
        title="Checkout"
        subtitle={event.title}
      />

      <CheckoutSteps
        current={
          phase === "review"
            ? "review"
            : phase === "payment"
            ? "payment"
            : phase === "done"
            ? "done"
            : "payment"
        }
      />

      <AnimatePresence mode="wait">
        {phase === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {reservationExpiresAt && (
              <ReservationTimer expiresAt={reservationExpiresAt} />
            )}
            <OrderReview />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.eventDetail(event.slug))}
              >
                Keep browsing
              </Button>
              <Button
                size="lg"
                onClick={async () => {
                  if (!isAuthenticated) {
                    navigate(ROUTES.login, {
                      state: { from: `/checkout/${slug}` },
                    });
                    return;
                  }
                  const ok = await createOrder();
                  if (ok) setPhase("payment");
                }}
              >
                Continue to payment
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-5 lg:grid-cols-[1fr_380px]"
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Payment method
                </h3>
                <PaymentMethodSelector value={method} onChange={setMethod} />
              </div>

              <div className="rounded-xl border border-border bg-card/50 p-4 flex items-start gap-3 text-xs text-muted-foreground">
                <ShieldCheck size={16} className="text-success shrink-0 mt-0.5" />
                <p>
                  Your payment is processed securely by our provider. Ticket
                  issuance is confirmed only after our backend verifies the
                  transaction — you'll see your QR tickets as soon as that
                  completes.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button variant="outline" onClick={() => setPhase("review")}>
                  Back
                </Button>
                <Button size="lg" onClick={startPayment}>
                  Pay {currency === "NGN" ? "₦" : ""}
                  {new Intl.NumberFormat("en-NG").format(total / 100)}
                </Button>
              </div>
            </div>

            <OrderSummary
              lines={summaryLines}
              subtotal={subtotal}
              fees={fees}
              total={total}
              currency={currency}
            />
          </motion.div>
        )}

        {(phase === "processing" || (phase === "failed" && verifying)) && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto"
          >
            <PaymentProcessingState step={verifying ? "verifying" : "processing"} />
          </motion.div>
        )}

        {phase === "failed" && !verifying && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto"
          >
            <PaymentFailedState
              reason={errorCode}
              onRetry={retry}
              onBack={() => navigate(ROUTES.eventDetail(event.slug))}
            />
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-success/20 flex items-center justify-center mb-3">
                <Clock size={22} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Payment confirmed — your tickets are ready
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Each admission has its own QR code. Save them to your phone
                or download for later.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Tickets have also been sent to{" "}
                <span className="text-foreground font-medium">{user?.email}</span>.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {issuedTickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Ticket</div>
                      <div className="text-sm font-semibold truncate">
                        {t.attendeeName}
                      </div>
                    </div>
                    <TicketStatusBadge status={t.status} size="sm" />
                  </div>
                  <div className="flex justify-center">
                    <TicketQRCode token={t.verificationToken} size={148} />
                  </div>
                  <div className="text-center text-[11px] text-muted-foreground font-mono">
                    {t.reference}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.myTickets)} size="lg">
                Go to My Tickets
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(ROUTES.eventDetail(event.slug))}
              >
                Back to event
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}