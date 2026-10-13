import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "../../utils/cn";
import { formatTime } from "../../utils/dates";

/**
 * Group / table attendance summary. The purchaser sees per-attendee
 * state. Other members do not gain organizer-level control.
 */
export function GroupAttendanceCard({ tickets = [], summary, className }) {
  if (!tickets.length) return null;

  const checkedIn = tickets.filter((t) => t.status === "CHECKED_IN").length;
  const total = tickets.length;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5",
        className
      )}
    >
      <header className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Table attendance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live check-in status for everyone on this order.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-foreground tabular-nums">
            {checkedIn} / {total}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            checked in
          </div>
        </div>
      </header>

      <div className="h-2 rounded-full bg-card-elevated overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${total ? (checkedIn / total) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-success to-emerald-400"
        />
      </div>

      <ul className="divide-y divide-border">
        {tickets.map((t) => {
          const isIn = t.status === "CHECKED_IN";
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span
                className={cn(
                  "shrink-0",
                  isIn ? "text-success" : "text-muted-foreground"
                )}
                aria-hidden
              >
                {isIn ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {t.attendeeName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {t.attendeeEmail}
                </div>
              </div>
              <div className="text-right shrink-0">
                {isIn ? (
                  <>
                    <div className="text-xs font-medium text-success">Checked In</div>
                    {t.checkedInAt && (
                      <div className="text-[10px] text-muted-foreground">
                        {formatTime(t.checkedInAt)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">Valid</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {summary && (
        <p className="mt-3 text-[11px] text-subtle">
          Only the purchaser can see aggregate attendance. Individual attendees
          cannot view the group's status.
        </p>
      )}
    </div>
  );
}

export default GroupAttendanceCard;