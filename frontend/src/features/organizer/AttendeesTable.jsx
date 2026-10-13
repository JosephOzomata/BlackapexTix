import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { TicketStatusBadge } from "../../components/tickets/TicketStatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { Pagination } from "../../components/common/Pagination";
import { PAGINATION } from "../../constants/config";
import { formatDateTime } from "../../utils/dates";
import { cn } from "../../utils/cn";
import { Users } from "lucide-react";

export function AttendeesTable({ tickets = [], loading = false }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = PAGINATION.defaultAdminPageSize;

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (status && t.status !== status) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return (
        t.attendeeName?.toLowerCase().includes(needle) ||
        t.attendeeEmail?.toLowerCase().includes(needle) ||
        t.reference?.toLowerCase().includes(needle)
      );
    });
  }, [tickets, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-border">
        <Input
          placeholder="Search by name, email, or reference"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search size={14} />}
          containerClassName="flex-1"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All statuses" },
            { value: "VALID", label: "Valid" },
            { value: "CHECKED_IN", label: "Checked In" },
            { value: "EXPIRED", label: "Expired" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "REFUNDED", label: "Refunded" },
          ]}
          containerClassName="sm:w-48"
        />
        <Button variant="outline" size="md" leftIcon={<Download size={14} />}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-md" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <EmptyState
          icon={<Users size={26} />}
          title="No attendees found"
          description={q || status ? "Try widening your filters." : "Attendees will appear here as tickets are sold."}
          size="sm"
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card-elevated/50 text-muted-foreground">
                <tr className="text-left">
                  <Th>Attendee</Th>
                  <Th className="hidden md:table-cell">Ticket</Th>
                  <Th className="hidden lg:table-cell">Reference</Th>
                  <Th>Status</Th>
                  <Th className="hidden sm:table-cell">Check-in</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((t) => (
                  <tr key={t.id} className="hover:bg-card-elevated/40">
                    <Td>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {t.attendeeName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t.attendeeEmail}
                        </div>
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell text-muted-foreground">
                      {t.ticketType?.name}
                    </Td>
                    <Td className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                      {t.reference}
                    </Td>
                    <Td>
                      <TicketStatusBadge status={t.status} size="sm" />
                    </Td>
                    <Td className="hidden sm:table-cell text-xs text-muted-foreground">
                      {t.checkedInAt ? formatDateTime(t.checkedInAt, "d MMM · h:mm a") : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children, className }) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-[10px] uppercase tracking-wider font-bold",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export default AttendeesTable;