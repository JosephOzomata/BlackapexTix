import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Ban } from "lucide-react";
import { formatTime } from "../../utils/dates";

const TONE = {
  VALID: {
    Icon: CheckCircle2,
    bg: "from-emerald-500 to-emerald-700",
    heading: "VALID TICKET",
    sub: "Entry Approved",
  },
  ALREADY_USED: {
    Icon: Clock,
    bg: "from-amber-500 to-amber-700",
    heading: "ALREADY CHECKED IN",
    sub: "Duplicate scan",
  },
  WRONG_EVENT: {
    Icon: AlertTriangle,
    bg: "from-orange-500 to-orange-700",
    heading: "INVALID FOR THIS EVENT",
    sub: "This ticket belongs to a different event",
  },
  EXPIRED: {
    Icon: Clock,
    bg: "from-slate-500 to-slate-700",
    heading: "TICKET EXPIRED",
    sub: "This ticket is no longer valid",
  },
  CANCELLED: {
    Icon: XCircle,
    bg: "from-red-500 to-red-700",
    heading: "TICKET CANCELLED",
    sub: "This ticket was cancelled",
  },
  INVALID: {
    Icon: XCircle,
    bg: "from-red-500 to-red-700",
    heading: "INVALID TICKET",
    sub: "This code is not recognised",
  },
  PENDING: {
    Icon: Clock,
    bg: "from-slate-500 to-slate-700",
    heading: "PAYMENT NOT CONFIRMED",
    sub: "This ticket isn't valid yet",
  },
};

/**
 * Full-screen scan result overlay. Intentionally large and colour-coded
 * so door staff can read it instantly. Uses semantic colours — not
 * event theme colours — for maximum clarity.
 */
export function ScannerResultOverlay({ result, onDismiss, autoDismissMs = 2600 }) {
  useEffect(() => {
    if (!result) return;
    const id = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(id);
  }, [result, onDismiss, autoDismissMs]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-live="assertive"
          onClick={onDismiss}
          className="fixed inset-0 z-modal flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`w-full max-w-md rounded-3xl bg-gradient-to-br ${TONE[result.kind]?.bg ?? TONE.INVALID.bg} p-8 text-white shadow-2xl`}
          >
            {(() => {
              const cfg = TONE[result.kind] ?? TONE.INVALID;
              const Icon = cfg.Icon;
              return (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon size={44} strokeWidth={2.5} />
                    </div>
                  </div>
                  <h2 className="text-center text-2xl font-extrabold tracking-tight">
                    {cfg.heading}
                  </h2>
                  <p className="text-center text-sm opacity-90 mt-1">{cfg.sub}</p>

                  {result.ticket && (
                    <div className="mt-6 rounded-2xl bg-black/25 backdrop-blur-sm p-4 space-y-2 text-sm">
                      <Row label="Attendee" value={result.ticket.attendeeName} />
                      <Row
                        label="Ticket"
                        value={result.ticket.ticketType?.name ?? "—"}
                      />
                      <Row label="Reference" value={result.ticket.reference} mono />
                      {result.kind === "VALID" && result.checkedInAt && (
                        <Row
                          label="Checked in at"
                          value={formatTime(result.checkedInAt)}
                        />
                      )}
                      {result.kind === "ALREADY_USED" && result.ticket.checkedInAt && (
                        <Row
                          label="Originally scanned"
                          value={formatTime(result.ticket.checkedInAt)}
                        />
                      )}
                    </div>
                  )}

                  {result.message && !result.ticket && (
                    <p className="mt-5 text-center text-sm opacity-90">{result.message}</p>
                  )}

                  <p className="mt-6 text-center text-xs opacity-75">
                    Tap anywhere to continue
                  </p>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/70 text-xs uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className={`font-medium truncate ${mono ? "font-mono text-xs" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default ScannerResultOverlay;