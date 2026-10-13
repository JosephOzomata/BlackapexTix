import { StatusBadge } from "../common/StatusBadge";

export function TicketStatusBadge({ status, size = "md" }) {
  return <StatusBadge kind="ticket" status={status} size={size} />;
}

export default TicketStatusBadge;