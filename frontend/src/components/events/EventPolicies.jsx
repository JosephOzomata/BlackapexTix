import { Shield, AlertCircle, ScrollText, Mail, Phone } from "lucide-react";
import { Accordion, AccordionItem } from "../common/Accordion";

export function EventPolicies({ event }) {
  if (!event) return null;

  return (
    <div className="rounded-2xl border border-[var(--event-border)] bg-[var(--event-surface)] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--event-foreground)] mb-4">
        Event policies
      </h2>
      <div className="text-[var(--event-foreground)]/90">
        <Accordion>
          {event.refundPolicy && (
            <AccordionItem
              title={
                <span className="flex items-center gap-2">
                  <Shield size={14} /> Refund policy
                </span>
              }
            >
              {event.refundPolicy}
            </AccordionItem>
          )}
          {event.rules && (
            <AccordionItem
              title={
                <span className="flex items-center gap-2">
                  <AlertCircle size={14} /> Event rules
                </span>
              }
            >
              {event.rules}
            </AccordionItem>
          )}
          <AccordionItem
            title={
              <span className="flex items-center gap-2">
                <ScrollText size={14} /> Additional information
              </span>
            }
          >
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-[var(--event-muted)]">Ticket sales end: </span>
                {event.salesEndAt
                  ? new Date(event.salesEndAt).toLocaleString()
                  : "At event start"}
              </li>
              {event.ageRestriction && (
                <li>
                  <span className="text-[var(--event-muted)]">Age restriction: </span>
                  {event.ageRestriction}+
                </li>
              )}
            </ul>
          </AccordionItem>
          <AccordionItem
            title={
              <span className="flex items-center gap-2">
                <Mail size={14} /> Contact organizer
              </span>
            }
          >
            <div className="space-y-2 text-sm">
              {event.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[var(--event-muted)]" />
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="text-[var(--event-primary)] hover:underline"
                  >
                    {event.contactEmail}
                  </a>
                </div>
              )}
              {event.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[var(--event-muted)]" />
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="text-[var(--event-primary)] hover:underline"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default EventPolicies;