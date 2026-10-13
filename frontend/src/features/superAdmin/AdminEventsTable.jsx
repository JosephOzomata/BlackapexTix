import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ExternalLink, Ban } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { StatusBadge } from "../../components/common/StatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { formatDateTime } from "../../utils/dates";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";
import { Calendar } from "lucide-react";

export function AdminEventsTable({ items = [], loading, onCancel }) {
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(null);

  const filtered = items.filter((e) => {
    if (!q) return true;
    return e.title?.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search events"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={14} />}
        />
      </div>

      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={26} />} title="No events found" size="sm" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card-elevated/50 text-muted-foreground">
              <tr className="text-left">
                <Th>Event</Th>
                <Th className="hidden md:table-cell">Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-card-elevated/40">
                  <Td>
                    <div className="font-medium text-foreground truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {e.organizer?.businessName}
                    </div>
                  </Td>
                  <Td className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatDateTime(e.startAt, "d MMM yyyy")}
                  </Td>
                  <Td><StatusBadge kind="event" status={e.status} size="sm" /></Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        as={Link}
                        to={ROUTES.eventDetail(e.slug)}
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Preview"
                      >
                        <ExternalLink size={14} />
                      </Button>
                      {e.status !== "CANCELLED" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-danger"
                          aria-label="Cancel event"
                          onClick={() => setConfirm(e)}
                        >
                          <Ban size={14} />
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          onCancel?.(confirm.id, "Cancelled by platform admin");
          setConfirm(null);
        }}
        title="Cancel this event?"
        description={`"${confirm?.title}" will be cancelled platform-wide.`}
        confirmLabel="Cancel event"
      />
    </div>
  );
}

function Th({ children, className }) {
  return <th scope="col" className={cn("px-4 py-3 text-[10px] uppercase tracking-wider font-bold", className)}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export default AdminEventsTable;