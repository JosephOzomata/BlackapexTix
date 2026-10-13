import { useEffect, useState } from "react";
import { Mail, User2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "../common/Input";
import { cn } from "../../utils/cn";
import { customersService } from "../../services/customers.service";
import { useDebounce } from "../../hooks/useDebounce";
import { dedupeEmails } from "../../utils/validators";

/**
 * Collects attendee details for group/table tickets.
 * Runs an account-existence check via a mock service so the UI can
 * show "Account found" / "No account" states. The real backend will
 * link unregistered attendees automatically when they later sign up.
 */
export function AttendeeForm({
  count = 1,
  value = [],
  onChange,
  ticketTypeName = "Ticket",
}) {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState({});

  // Ensure the array length matches count.
  useEffect(() => {
    const next = Array.from({ length: count }).map(
      (_, i) => value[i] ?? { fullName: "", email: "" }
    );
    if (JSON.stringify(next) !== JSON.stringify(value)) onChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const emailsKey = value.map((a) => a?.email?.trim().toLowerCase()).join("|");
  const debouncedEmailsKey = useDebounce(emailsKey, 500);

  useEffect(() => {
    const emails = value
      .map((a) => a?.email?.trim().toLowerCase())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (!emails.length) {
      setResults({});
      return;
    }
    let cancelled = false;
    (async () => {
      setChecking(true);
      const res = await customersService.checkAccountsByEmails(emails);
      if (cancelled) return;
      if (res.success) {
        const map = {};
        for (const r of res.data.results) map[r.email] = r;
        setResults(map);
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEmailsKey]);

  const update = (index, patch) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange?.(next);
  };

  const { duplicates } = dedupeEmails(value.map((a) => a?.email));

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-[var(--event-foreground)]">
            Attendee details
          </h4>
          <p className="text-xs text-[var(--event-muted)] mt-0.5">
            Each attendee receives their own individual QR ticket by email.
          </p>
        </div>
        {checking && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--event-muted)]">
            <Loader2 size={12} className="animate-spin" /> Checking accounts…
          </span>
        )}
      </header>

      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => {
          const a = value[i] ?? { fullName: "", email: "" };
          const email = a.email?.trim().toLowerCase() ?? "";
          const isDup = duplicates.includes(email);
          const found = results[email]?.status === "FOUND";
          const notFound = results[email]?.status === "NOT_FOUND";
          const invalid = Boolean(email) && results[email]?.status === "INVALID";

          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border border-[var(--event-border)] bg-[var(--event-background)] p-3 sm:p-4"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--event-primary)]">
                  Attendee {i + 1}
                </span>
                {found && !isDup && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-success)] font-medium">
                    <CheckCircle2 size={12} /> Account found
                  </span>
                )}
                {notFound && !isDup && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--event-muted)]">
                    <Mail size={12} /> No account — we'll create their ticket by email
                  </span>
                )}
                {isDup && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-danger)] font-medium">
                    <AlertCircle size={12} /> Duplicate email
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full name"
                  placeholder="e.g. John Doe"
                  value={a.fullName}
                  onChange={(e) => update(i, { fullName: e.target.value })}
                  leftIcon={<User2 size={14} />}
                  error={a.fullName && a.fullName.trim().length < 2 ? "Enter a full name" : undefined}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  value={a.email}
                  onChange={(e) => update(i, { email: e.target.value })}
                  leftIcon={<Mail size={14} />}
                  error={
                    isDup
                      ? "This email appears more than once"
                      : invalid
                      ? "Invalid email address"
                      : a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email)
                      ? "Enter a valid email"
                      : undefined
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttendeeForm;