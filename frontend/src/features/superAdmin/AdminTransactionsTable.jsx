import { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { Input } from "../../components/common/Input";
import { StatusBadge } from "../../components/common/StatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/currency";
import { formatDateTime } from "../../utils/dates";
import { cn } from "../../utils/cn";

export function AdminTransactionsTable({ items = [], loading }) {
  const [q, setQ] = useState("");
  const filtered = items.filter((t) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      t.reference?.toLowerCase().includes(needle) ||
      t.customerEmail?.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search transactions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={14} />}
        />
      </div>

      {loading ? (
        <div className="p-5 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Receipt size={26} />} title="No transactions found" size="sm" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card-elevated/50 text-muted-foreground">
              <tr className="text-left">
                <Th>Reference</Th>
                <Th className="hidden md:table-cell">Customer</Th>
                <Th>Amount</Th>
                <Th className="hidden lg:table-cell">Platform fee</Th>
                <Th>Status</Th>
                <Th className="hidden sm:table-cell">Date</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-card-elevated/40">
                  <Td className="font-mono text-xs">{t.reference}</Td>
                  <Td className="hidden md:table-cell text-muted-foreground">
                    {t.customerEmail}
                  </Td>
                  <Td className="font-medium tabular-nums">
                    {formatCurrency(t.amount, t.currency)}
                  </Td>
                  <Td className="hidden lg:table-cell tabular-nums text-muted-foreground">
                    {formatCurrency(t.platformFee ?? 0, t.currency)}
                  </Td>
                  <Td><StatusBadge kind="payment" status={t.status} size="sm" /></Td>
                  <Td className="hidden sm:table-cell text-xs text-muted-foreground">
                    {formatDateTime(t.createdAt, "d MMM yyyy · h:mm a")}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className }) {
  return <th scope="col" className={cn("px-4 py-3 text-[10px] uppercase tracking-wider font-bold", className)}>{children}</th>;
}
function Td({ children, className }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export default AdminTransactionsTable;