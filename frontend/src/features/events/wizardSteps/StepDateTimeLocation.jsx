import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/common/Input";

export function StepDateTimeLocation() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Event start"
          type="datetime-local"
          required
          error={errors.startAt?.message}
          {...register("startAt")}
        />
        <Input
          label="Event end"
          type="datetime-local"
          required
          error={errors.endAt?.message}
          {...register("endAt")}
        />
        <Input
          label="Doors open (optional)"
          type="datetime-local"
          {...register("doorsOpenAt")}
        />
        <Input
          label="Ticket sales end (optional)"
          type="datetime-local"
          hint="Leave blank to end sales at event start"
          {...register("salesEndAt")}
        />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <Input
          label="Venue name"
          placeholder="e.g. Elegushi Beach"
          required
          error={errors.venue?.message}
          {...register("venue")}
        />
        <Input
          label="Street address"
          placeholder="e.g. 1415 Adetokunbo Ademola Street"
          required
          error={errors.addressLine?.message}
          {...register("addressLine")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="City"
            required
            error={errors.city?.message}
            {...register("city")}
          />
          <Input label="State / Region" {...register("state")} />
          <Input label="Country code" defaultValue="NG" {...register("country")} />
        </div>
      </div>
    </div>
  );
}

export default StepDateTimeLocation;