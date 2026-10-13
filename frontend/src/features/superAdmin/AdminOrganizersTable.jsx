import { useState } from "react";
import { Search, ShieldCheck, ShieldOff, Ban } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/currency";
import { cn } from "../../utils/cn";
import { Building2 } from "lucide-react";

const TONE = {
  PENDING: "warning",
  APPROVED: "info",
  VERIFIED: "success",
  SUSPENDED: "danger",
  REJECTED: "danger",
};

export function AdminOrganizersTable({ items = [], loading, onStatusChange }) {
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState(null);

  const filtered = items.filter((o) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      o.businessName?.toLowerCase().includes(needle) ||
      o.ownerEmail?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search organizers"
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
        <EmptyState icon={<Building2 size={26} />} title="No organizers found" size="sm" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card-elevated/50 text-muted-foreground">
              <tr className="text-left">
                <Th>Organizer</Th>
                <Th className="hidden md:table-cell">Contact</Th>
                <Th>Revenue</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-card-elevated/40">
                  <Td>
                    <div className="font-medium text-foreground truncate">{o.businessName}</div>
                    <div className="text-xs text-muted-foreground truncate">/{o.slug}</div>
                  </Td>
                  <Td className="hidden md:table-cell text-muted-foreground">
                    {o.ownerEmail ?? "—"}
                  </Td>
                  <Td className="tabular-nums">{formatCurrency(o.grossRevenue ?? 0, "NGN")}</Td>
                  <Td>
                    <Badge tone={TONE[o.status] ?? "neutral"} size="sm">{o.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-1">
                      {o.status !== "VERIFIED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<ShieldCheck size={12} />}
                          onClick={() =>
                            onStatusChange?.({ organizerId: o.id, status: "VERIFIED" })
                          }
                        >
                          Verify
                        </Button>
                      )}
                      {o.status === "VERIFIED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger"
                          leftIcon={<ShieldOff size={12} />}
                          onClick={() => setConfirm({ organizerId: o.id, status: "SUSPENDED", name: o.businessName })}
                        >
                          Suspend
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
          onStatusChange?.(confirm);
          setConfirm(null);
        }}
        title="Suspend this organizer?"
        description={`${confirm?.name} will lose the ability to publish new events immediately.`}
        confirmLabel="Suspend"
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

export default AdminOrganizersTable;