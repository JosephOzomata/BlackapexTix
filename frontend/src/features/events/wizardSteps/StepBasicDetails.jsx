import { useFormContext, useFieldArray } from "react-hook-form";
import { X, Plus } from "lucide-react";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { Button } from "../../../components/common/Button";
import { EventCategoryChips } from "../../../components/events/EventCategoryChips";

export function StepBasicDetails() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const category = watch("categorySlug");
  const tags = watch("tags") ?? [];

  const addTag = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = e.currentTarget.value.trim();
    if (!v || tags.includes(v)) return;
    setValue("tags", [...tags, v], { shouldDirty: true });
    e.currentTarget.value = "";
  };

  const removeTag = (t) =>
    setValue("tags", tags.filter((x) => x !== t), { shouldDirty: true });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <Input
        label="Event title"
        placeholder="Give your event a catchy name"
        required
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Description"
        placeholder="What's the vibe? Who's performing? What should attendees expect?"
        rows={6}
        showCount
        maxLength={5000}
        required
        error={errors.description?.message}
        {...register("description")}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Category <span className="text-danger ml-0.5">*</span>
        </label>
        <EventCategoryChips
          value={category}
          onChange={(v) => setValue("categorySlug", v, { shouldDirty: true })}
          showAll={false}
          layout="wrap"
        />
        {errors.categorySlug && (
          <p role="alert" className="mt-1.5 text-xs text-danger">
            {errors.categorySlug.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full bg-card-elevated border border-border px-3 py-1 text-xs"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                className="text-muted-foreground hover:text-danger"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Type and press Enter — e.g. beach, amapiano"
          onKeyDown={addTag}
        />
      </div>
    </div>
  );
}

export default StepBasicDetails;