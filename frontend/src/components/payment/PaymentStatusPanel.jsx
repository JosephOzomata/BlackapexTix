import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, Ban } from "lucide-react";

/**
 * Consolidated status panel used in My Tickets and the group order page.
 * Uses semantic colours from the global design system — not event colors —
 * so statuses remain readable regardless of event theme.
 */
export function PaymentStatusPanel({ order }) {
  if (!order) return null;

  const cfg = (() => {
    switch (order.paymentStatus) {
      case "CONFIRMED":
        return {
          tone: "success",
          icon: CheckCircle2,
          title: "Payment confirmed",
          body: "Tickets have been issued and are visible in My Tickets.",
        };
      case "AWAITING_VERIFICATION":
        return {
          tone: "info",
          icon: Clock,
          title: "Awaiting verification",
          body: "We're confirming your payment with the provider. Tickets will appear automatically.",
        };
      case "VERIFICATION_DELAYED":
        return {
          tone: "warning",
          icon: AlertTriangle,
          title: "Verification delayed",
          body: "We're still confirming your payment. You'll be notified as soon as it completes.",
        };
      case "FAILED":
        return {
          tone: "danger",
          icon: Ban,
          title: "Payment failed",
          body: "No money was taken. You can try again from the event page.",
        };
      case "CANCELLED":
        return {
          tone: "danger",
          icon: Ban,
          title: "Payment cancelled",
          body: "You cancelled this payment.",
        };
      case "EXPIRED":
        return {
          tone: "neutral",
          icon: Clock,
          title: "Order expired",
          body: "The reservation window closed before payment completed.",
        };
      default:
        return {
          tone: "warning",
          icon: Clock,
          title: "Payment pending",
          body: "Complete the payment to receive your tickets.",
        };
    }
  })();

  const Icon = cfg.icon;
  const tone = {
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-danger/30 bg-danger/10 text-danger",
    info: "border-info/30 bg-info/10 text-info",
    neutral: "border-border bg-card text-muted-foreground",
  }[cfg.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 flex items-start gap-3 ${tone}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold">{cfg.title}</div>
        <div className="text-xs mt-1 opacity-90">{cfg.body}</div>
      </div>
    </motion.div>
  );
}

export default PaymentStatusPanel;