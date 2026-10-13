import { useFormContext } from "react-hook-form";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { EventThemePreview } from "../EventThemePreview";
import { formatPrice } from "../../../utils/currency";

export function StepPreviewPublish() {
  const values = useFormContext().watch();
  const {
    title, description, categorySlug, startAt, endAt, venue, city,
    media, theme, ticketTypes, refundPolicy, contactEmail,
  } = values;

  const checks = [
    { label: "Title set", ok: Boolean(title?.trim().length >= 4) },
    { label: "Description added", ok: Boolean(description?.trim().length >= 30) },
    { label: "Category chosen", ok: Boolean(categorySlug) },
    { label: "Dates set", ok: Boolean(startAt && endAt) },
    { label: "Venue set", ok: Boolean(venue && city) },
    { label: "At least one flyer", ok: Boolean(media?.length) },
    { label: "Theme generated", ok: Boolean(theme) },
    { label: "Ticket categories added", ok: Boolean(ticketTypes?.length) },
    { label: "Refund policy", ok: Boolean(refundPolicy?.trim()) },
    { label: "Contact email", ok: Boolean(contactEmail?.trim()) },
  ];

  const ready = checks.every((c) => c.ok);

  const preview = {
    title, categorySlug, startAt, endAt, venue, city, media,
    startingPrice: ticketTypes?.length
      ? Math.min(...ticketTypes.map((t) => Number(t.price || 0) * 100))
      : 0,
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground mb-3">
          Publish checklist
        </h3>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li
              key={c.label}
              className="flex items-center gap-2 text-sm"
            >
              {c.ok ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <AlertTriangle size={16} className="text-warning" />
              )}
              <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {ready
              ? "You're ready to publish. Click Publish event below."
              : "Complete the missing items before publishing. You can still save as a draft."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground mb-3">
          What customers will see
        </h3>
        <EventThemePreview theme={theme} event={preview} />
        {ticketTypes?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Ticket categories
            </p>
            {ticketTypes.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2 text-sm"
              >
                <span className="truncate">
                  {t.name || "Untitled"}
                  {t.admits > 1 && (
                    <span className="text-muted-foreground ml-1.5">
                      (admits {t.admits})
                    </span>
                  )}
                </span>
                <span className="font-medium tabular-nums">
                  {formatPrice(Number(t.price || 0) * 100)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StepPreviewPublish;