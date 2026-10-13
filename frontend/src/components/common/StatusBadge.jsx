import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCcw,
  Ban,
  CircleDashed,
  MinusCircle,
} from "lucide-react";
import { Badge } from "./Badge";
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_TONE,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TONE,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from "../../constants/statuses";

const ICONS = {
  DRAFT: CircleDashed,
  SCHEDULED: Clock,
  PUBLISHED: CheckCircle2,
  SALES_LIVE: CheckCircle2,
  SALES_ENDED: Clock,
  SOLD_OUT: AlertCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  UNPUBLISHED: Ban,

  PENDING_PAYMENT: Clock,
  PAYMENT_CONFIRMED: CheckCircle2,
  PAYMENT_PROCESSING: RefreshCcw,
  AWAITING_PAYMENT: Clock,
  AWAITING_VERIFICATION: RefreshCcw,
  VERIFICATION_DELAYED: AlertCircle,
  VALID: CheckCircle2,
  CHECKED_IN: CheckCircle2,
  EXPIRED: MinusCircle,
  REFUNDED: RefreshCcw,
  VOID: Ban,
  FAILED: XCircle,
  PAID: CheckCircle2,
  FULFILLED: CheckCircle2,
  PARTIALLY_REFUNDED: RefreshCcw,

  PENDING: Clock,
  INITIATED: RefreshCcw,
  PROCESSING: RefreshCcw,
  CONFIRMED: CheckCircle2,
};

const MAP = {
  event: { labels: EVENT_STATUS_LABELS, tones: EVENT_STATUS_TONE },
  ticket: { labels: TICKET_STATUS_LABELS, tones: TICKET_STATUS_TONE },
  order: { labels: ORDER_STATUS_LABELS, tones: ORDER_STATUS_TONE },
  payment: { labels: PAYMENT_STATUS_LABELS, tones: PAYMENT_STATUS_TONE },
};

export function StatusBadge({ kind = "ticket", status, size = "md", className }) {
  const cfg = MAP[kind] ?? MAP.ticket;
  const label = cfg.labels[status] ?? status;
  const tone = cfg.tones[status] ?? "neutral";
  const Icon = ICONS[status] ?? CircleDashed;

  return (
    <Badge tone={tone} size={size} className={className} icon={<Icon size={12} />}>
      {label}
    </Badge>
  );
}

export default StatusBadge;