import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Cloud, CloudOff } from "lucide-react";
import { Button } from "../../components/common/Button";
import { cn } from "../../utils/cn";
import { StepBasicDetails } from "./wizardSteps/StepBasicDetails";
import { StepDateTimeLocation } from "./wizardSteps/StepDateTimeLocation";
import { StepMedia } from "./wizardSteps/StepMedia";
import { StepTheme } from "./wizardSteps/StepTheme";
import { StepTickets } from "./wizardSteps/StepTickets";
import { StepPolicies } from "./wizardSteps/StepPolicies";
import { StepPreviewPublish } from "./wizardSteps/StepPreviewPublish";
import { FEES } from "../../constants/config";

const STEPS = [
  { key: "basic", label: "Basic details", Component: StepBasicDetails },
  { key: "when", label: "Date & location", Component: StepDateTimeLocation },
  { key: "media", label: "Media", Component: StepMedia },
  { key: "theme", label: "Theme", Component: StepTheme },
  { key: "tickets", label: "Tickets", Component: StepTickets },
  { key: "policies", label: "Policies", Component: StepPolicies },
  { key: "publish", label: "Preview & publish", Component: StepPreviewPublish },
];

const ticketTypeSchema = z.object({
  name: z.string().min(2, "Name is required").max(60),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().default("NGN"),
  quantityTotal: z.coerce.number().int().min(1, "Must be at least 1"),
  minPerOrder: z.coerce.number().int().min(1).default(1),
  maxPerOrder: z.coerce.number().int().min(1).default(5),
  admits: z.coerce.number().int().min(1).default(1),
  type: z.string().default("GENERAL"),
  benefits: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
});

export const eventWizardSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(120),
  description: z.string().min(30, "Give us at least 30 characters").max(5000),
  categorySlug: z.string().min(1, "Pick a category"),
  tags: z.array(z.string()).default([]),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  doorsOpenAt: z.string().optional().default(""),
  salesEndAt: z.string().optional().default(""),
  venue: z.string().min(2, "Venue is required"),
  addressLine: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional().default(""),
  country: z.string().default("NG"),
  media: z.array(z.any()).default([]),
  theme: z.any().nullable().default(null),
  ticketTypes: z.array(ticketTypeSchema).min(1, "Add at least one ticket category"),
  refundPolicy: z.string().optional().default(""),
  rules: z.string().optional().default(""),
  ageRestriction: z.coerce.number().int().min(0).max(99).optional(),
  contactEmail: z.string().email("Valid contact email required").optional().or(z.literal("")),
  contactPhone: z.string().optional().default(""),
});

export function EventCreationWizard({ initialValues, onSubmit, savingDraft, savingMessage, mode = "create" }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dirty, setDirty] = useState(false);

  const methods = useForm({
    resolver: zodResolver(eventWizardSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      categorySlug: "",
      tags: [],
      startAt: "",
      endAt: "",
      doorsOpenAt: "",
      salesEndAt: "",
      venue: "",
      addressLine: "",
      city: "",
      state: "",
      country: "NG",
      media: [],
      theme: null,
      ticketTypes: [],
      refundPolicy: "",
      rules: "",
      ageRestriction: undefined,
      contactEmail: "",
      contactPhone: "",
    },
    mode: "onBlur",
  });

  const { handleSubmit, formState: { isDirty, isSubmitting }, trigger } = methods;
  useEffect(() => setDirty(isDirty), [isDirty]);

  const Step = STEPS[stepIndex].Component;

  const next = async () => {
    // Only validate fields that belong to the current step.
    const valid = await trigger(undefined, { shouldFocus: true });
    if (!valid) return;
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };
  const prev = () => setStepIndex((i) => Math.max(0, i - 1));

  const submit = handleSubmit(async (values) => {
    // Convert major-unit prices to minor (kobo).
    const normalised = {
      ...values,
      ticketTypes: values.ticketTypes.map((t) => ({
        ...t,
        price: Math.round(Number(t.price || 0) * 100),
      })),
    };
    await onSubmit?.(normalised);
  });

  const progress = useMemo(
    () => ((stepIndex + 1) / STEPS.length) * 100,
    [stepIndex]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={submit} className="space-y-6">
        {/* Stepper header */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">
                Step {stepIndex + 1} of {STEPS.length}
              </p>
              <h2 className="text-lg font-semibold text-foreground mt-0.5">
                {STEPS[stepIndex].label}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {savingDraft ? (
                <>
                  <Cloud size={14} className="text-info animate-pulse" />
                  {savingMessage ?? "Saving…"}
                </>
              ) : dirty ? (
                <>
                  <CloudOff size={14} /> Unsaved changes
                </>
              ) : (
                <>
                  <Save size={14} className="text-success" /> All changes saved
                </>
              )}
            </div>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-card-elevated overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
            />
          </div>

          <nav
            aria-label="Wizard steps"
            className="mt-3 flex gap-1 overflow-x-auto no-scrollbar"
          >
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStepIndex(i)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  i === stepIndex
                    ? "bg-primary text-primary-foreground"
                    : i < stepIndex
                    ? "bg-primary/15 text-primary hover:bg-primary/25"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[stepIndex].key}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Step />
          </motion.div>
        </AnimatePresence>

        {/* Footer controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={prev}
            disabled={stepIndex === 0}
            leftIcon={<ChevronLeft size={16} />}
          >
            Back
          </Button>

          {stepIndex < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              onClick={next}
              rightIcon={<ChevronRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {mode === "edit" ? "Save changes" : "Publish event"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default EventCreationWizard;