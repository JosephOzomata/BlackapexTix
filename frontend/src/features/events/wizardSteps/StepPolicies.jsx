import { useFormContext } from "react-hook-form";
import { Textarea } from "../../../components/common/Textarea";
import { Input } from "../../../components/common/Input";

export function StepPolicies() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <Textarea
        label="Refund policy"
        rows={4}
        placeholder="e.g. No refunds after 7 days to the event. Tickets are transferable."
        {...register("refundPolicy")}
      />

      <Textarea
        label="Event rules"
        rows={4}
        placeholder="e.g. Valid ID required. No outside food or drinks. Dress code enforced."
        {...register("rules")}
      />

      <Input
        label="Age restriction (optional)"
        type="number"
        min={0}
        placeholder="e.g. 18"
        {...register("ageRestriction", { valueAsNumber: true })}
      />

      <div className="border-t border-border pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Contact email"
          type="email"
          placeholder="support@yourevent.com"
          error={errors.contactEmail?.message}
          {...register("contactEmail")}
        />
        <Input
          label="Contact phone (optional)"
          type="tel"
          placeholder="+234 800 000 0000"
          {...register("contactPhone")}
        />
      </div>
    </div>
  );
}

export default StepPolicies;