import { useRef } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Users } from "lucide-react";
import { TicketCard } from "./TicketCard";
import { DownloadTicketButton, ShareTicketButton } from "./DownloadTicketButton";
import { Button } from "../common/Button";
import { ROUTES } from "../../constants/routes";

export function TicketDetailCard({ ticket }) {
  const cardRef = useRef(null);
  if (!ticket) return null;

  const isGroup = (ticket.ticketType?.admits ?? 1) > 1;

  return (
    <div className="space-y-5">
      <TicketCard ref={cardRef} ticket={ticket} />

      <div className="flex flex-wrap gap-2">
        <DownloadTicketButton ticket={ticket} targetRef={cardRef} />
        <ShareTicketButton ticket={ticket} />
        {ticket.event?.slug && (
          <Button
            as={Link}
            to={ROUTES.eventDetail(ticket.event.slug)}
            variant="ghost"
            rightIcon={<ExternalLink size={14} />}
          >
            View event
          </Button>
        )}
        {isGroup && ticket.orderId && (
          <Button
            as={Link}
            to={ROUTES.groupOrder(ticket.orderId)}
            variant="outline"
            leftIcon={<Users size={14} />}
          >
            Group attendance
          </Button>
        )}
      </div>
    </div>
  );
}

export default TicketDetailCard;