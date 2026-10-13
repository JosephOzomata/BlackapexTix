import { motion } from "framer-motion";
import { CheckCircle2, History } from "lucide-react";
import { formatTime } from "../../utils/dates";
import { EmptyState } from "../common/EmptyState";

export function ScannerRecentCheckins({ items = [] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<History size={22} />}
        title="No check-ins yet"
        description="Recent check-ins will appear here as you scan."
        size="sm"
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {items.map((t, i) => (
        <motion.li
          key={t.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.15) }}
          className="flex items-center gap-3 py-2.5"
        >
          <CheckCircle2 size={16} className="text-success shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-foreground truncate">{t.attendeeName}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {t.ticketType?.name} · {t.reference}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground shrink-0">
            {t.checkedInAt ? formatTime(t.checkedInAt) : "—"}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

export default ScannerRecentCheckins;