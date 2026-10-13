import { useFormContext } from "react-hook-form";
import { FlyerThemeAnalyzer } from "../FlyerThemeAnalyzer";
import { EventThemePreview } from "../EventThemePreview";

export function StepTheme() {
  const { watch, setValue } = useFormContext();
  const media = watch("media") ?? [];
  const theme = watch("theme");
  const event = {
    title: watch("title"),
    categorySlug: watch("categorySlug"),
    startAt: watch("startAt"),
    endAt: watch("endAt"),
    venue: watch("venue"),
    city: watch("city"),
    startingPrice: 0,
    media,
  };

  const primary = media.find((m) => m.isPrimary) ?? media[0];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        {primary ? (
          <FlyerThemeAnalyzer
            imageSource={primary.previewUrl ?? primary.url}
            mediaId={primary.id}
            initialTheme={theme}
            onChange={(t) => setValue("theme", t, { shouldDirty: true })}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground">
              Add a flyer in the previous step to generate a theme.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-foreground mb-3">
          Live preview
        </h3>
        <EventThemePreview theme={theme} event={event} />
      </div>
    </div>
  );
}

export default StepTheme;