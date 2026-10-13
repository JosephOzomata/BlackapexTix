import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { customersService } from "../../services/customers.service";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../utils/cn";

/**
 * Small inline widget that reports whether an email has an account.
 * Reused by the group-order and checkout flows.
 */
export function AttendeeEmailCheck({ email, className }) {
  const [status, setStatus] = useState("idle");
  const debounced = useDebounce(email?.trim().toLowerCase() ?? "", 400);

  useEffect(() => {
    if (!debounced || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debounced)) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    (async () => {
      const res = await customersService.checkAccountsByEmails([debounced]);
      if (cancelled) return;
      const r = res.success ? res.data.results[0] : null;
      if (!r || r.status === "INVALID") setStatus("invalid");
      else if (r.status === "FOUND") setStatus("found");
      else setStatus("not-found");
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const cfg = {
    idle: null,
    checking: {
      Icon: Loader2,
      cls: "text-muted-foreground",
      label: "Checking…",
      spin: true,
    },
    found: {
      Icon: CheckCircle2,
      cls: "text-success",
      label: "Account found",
    },
    "not-found": {
      Icon: Mail,
      cls: "text-muted-foreground",
      label: "No account — we'll email this attendee their ticket",
    },
    invalid: {
      Icon: AlertCircle,
      cls: "text-danger",
      label: "Invalid email",
    },
  }[status];

  if (!cfg) return null;
  const { Icon, cls, label, spin } = cfg;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", cls, className)}>
      <Icon size={12} className={spin ? "animate-spin" : undefined} />
      {label}
    </span>
  );
}

export default AttendeeEmailCheck;