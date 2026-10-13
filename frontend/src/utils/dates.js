import {
  format,
  formatDistanceToNow,
  isBefore,
  isAfter,
  isSameDay,
  differenceInCalendarDays,
  parseISO,
  isValid,
} from "date-fns";

/**
 * All dates in data are ISO 8601 strings (backend will provide these).
 * These helpers centralise formatting so we never scatter date strings
 * through components.
 */

export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

/** "Sat, 12 Oct 2025" */
export function formatDate(value, pattern = "EEE, d MMM yyyy") {
  const d = toDate(value);
  return d ? format(d, pattern) : "—";
}

/** "12 Oct, 7:00 PM" */
export function formatDateTime(value, pattern = "d MMM, h:mm a") {
  const d = toDate(value);
  return d ? format(d, pattern) : "—";
}

/** "7:00 PM" */
export function formatTime(value, pattern = "h:mm a") {
  const d = toDate(value);
  return d ? format(d, pattern) : "—";
}

/** "in 3 days" / "2 hours ago" */
export function formatRelative(value) {
  const d = toDate(value);
  if (!d) return "—";
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

/**
 * Human-friendly event date range.
 * Examples:
 *   "Sat, 12 Oct 2025 · 7:00 PM – 11:00 PM"
 *   "12 – 14 Dec 2025"
 *   "Fri, 3 Jan 2026 · 8:00 PM"
 */
export function formatEventRange(start, end, { withTime = true } = {}) {
  const s = toDate(start);
  const e = toDate(end);
  if (!s) return "Date to be announced";
  if (!e || isSameDay(s, e)) {
    return withTime
      ? `${format(s, "EEE, d MMM yyyy")} · ${format(s, "h:mm a")} – ${format(e ?? s, "h:mm a")}`
      : format(s, "EEE, d MMM yyyy");
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${format(s, "d")} – ${format(e, "d MMM yyyy")}`;
  }
  if (sameYear) {
    return `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
  }
  return `${format(s, "d MMM yyyy")} – ${format(e, "d MMM yyyy")}`;
}

/** Short date badge for cards: { day: "12", month: "OCT", weekday: "SAT" } */
export function getDateBadge(value) {
  const d = toDate(value);
  if (!d) return { day: "—", month: "—", weekday: "—" };
  return {
    day: format(d, "d"),
    month: format(d, "MMM").toUpperCase(),
    weekday: format(d, "EEE").toUpperCase(),
  };
}

/** Relative day label: "Today", "Tomorrow", "In 3 days", "Past". */
export function getDayLabel(value) {
  const d = toDate(value);
  if (!d) return "";
  const now = new Date();
  const diff = differenceInCalendarDays(d, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 14) return `In ${diff} days`;
  if (diff < -1 && diff >= -14) return `${Math.abs(diff)} days ago`;
  return formatRelative(d);
}

export const isUpcoming = (value) => isAfter(toDate(value) ?? 0, new Date());
export const isPast = (value) => isBefore(toDate(value) ?? 0, new Date());

/** Format a duration in ms as mm:ss, used by reservation timers. */
export function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** ISO string for "now" — used when creating orders/tickets in mocks. */
export const nowISO = () => new Date().toISOString();

/** Add minutes to now, ISO string. */
export function addMinutesISO(minutes) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}