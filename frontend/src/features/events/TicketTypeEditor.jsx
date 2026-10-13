import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Trash2, Copy, GripVertical, Eye, EyeOff, Save, X,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { IconButton } from "../../components/common/IconButton";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/common/Textarea";
import { Badge } from "../../components/common/Badge";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { cn } from "../../utils/cn";
import { formatPrice } from "../../utils/currency";

/**
 * Fully editable ticket categories.
 * Uses react-hook-form's useFieldArray so the parent wizard owns the
 * form state. Categories are arbitrary — no hardcoded types.
 */
export function TicketTypeEditor({ name = "ticketTypes" }) {
  const { control, watch, register, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove, move, insert } = useFieldArray({ control, name });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const ticketTypes = watch(name) ?? [];

  const addEmpty = () => {
    append({
      name: "",
      description: "",
      price: "",
      currency: "NGN",
      quantityTotal: 100,
      minPerOrder: 1,
      maxPerOrder: 5,
      admits: 1,
      type: "GENERAL",
      benefits: [],
      isVisible: true,
    });
  };

  const duplicate = (index) => {
    const t = ticketTypes[index];
    insert(index + 1, { ...t, name: `${t.name} (Copy)` });
  };

  const setVisibility = (index, visible) => {
    setValue(`${name}.${index}.isVisible`, visible, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Ticket categories
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fully customizable. Any name, any price. Use{" "}
            <span className="font-medium text-foreground">Admits</span> to create
            table / group tickets.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={addEmpty}
        >
          Add category
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No ticket categories yet. Add at least one before publishing.
          </p>
          <Button className="mt-4" onClick={addEmpty} leftIcon={<Plus size={14} />}>
            Add your first category
          </Button>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={fields.map((f) => f.id)}
          onReorder={(order) => {
            const fromIndex = fields.findIndex((f) => f.id === order[0]);
            order.forEach((id, toIndex) => {
              const currentIndex = fields.findIndex((f) => f.id === id);
              if (currentIndex !== toIndex) move(currentIndex, toIndex);
            });
          }}
          className="space-y-3"
        >
          <AnimatePresence initial={false}>
            {fields.map((field, index) => (
              <Reorder.Item
                key={field.id}
                value={field.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    className="mt-2 cursor-grab text-muted-foreground hover:text-foreground touch-none"
                  >
                    <GripVertical size={16} />
                  </button>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral" size="sm">
                          #{index + 1}
                        </Badge>
                        {!ticketTypes[index]?.isVisible && (
                          <Badge tone="warning" size="sm">Hidden</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton
                          label={ticketTypes[index]?.isVisible ? "Hide" : "Show"}
                          size="icon-sm"
                          onClick={() => setVisibility(index, !ticketTypes[index]?.isVisible)}
                        >
                          {ticketTypes[index]?.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </IconButton>
                        <IconButton
                          label="Duplicate"
                          size="icon-sm"
                          onClick={() => duplicate(index)}
                        >
                          <Copy size={14} />
                        </IconButton>
                        <IconButton
                          label="Delete"
                          size="icon-sm"
                          onClick={() => setConfirmDelete(index)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Name"
                        placeholder="e.g. Early Bird, VIP Table"
                        error={errors?.[name]?.[index]?.name?.message}
                        {...register(`${name}.${index}.name`)}
                      />
                      <Input
                        label="Price (₦)"
                        type="number"
                        inputMode="numeric"
                        placeholder="0 for free"
                        error={errors?.[name]?.[index]?.price?.message}
                        {...register(`${name}.${index}.price`, { valueAsNumber: true })}
                      />
                    </div>

                    <Textarea
                      label="Description (optional)"
                      rows={2}
                      placeholder="What's included? Any special perks?"
                      {...register(`${name}.${index}.description`)}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        label="Capacity"
                        type="number"
                        inputMode="numeric"
                        error={errors?.[name]?.[index]?.quantityTotal?.message}
                        {...register(`${name}.${index}.quantityTotal`, { valueAsNumber: true })}
                      />
                      <Input
                        label="Admits"
                        type="number"
                        inputMode="numeric"
                        hint="People per ticket"
                        error={errors?.[name]?.[index]?.admits?.message}
                        {...register(`${name}.${index}.admits`, { valueAsNumber: true })}
                      />
                      <Input
                        label="Min / order"
                        type="number"
                        inputMode="numeric"
                        {...register(`${name}.${index}.minPerOrder`, { valueAsNumber: true })}
                      />
                      <Input
                        label="Max / order"
                        type="number"
                        inputMode="numeric"
                        {...register(`${name}.${index}.maxPerOrder`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="pt-1 text-xs text-muted-foreground">
                      {ticketTypes[index]?.price === 0 || ticketTypes[index]?.price === "0"
                        ? "Free category"
                        : `Sells at ${formatPrice(ticketTypes[index]?.price || 0)}`}
                      {ticketTypes[index]?.admits > 1 &&
                        ` · ${ticketTypes[index].admits} admissions per ticket (attendee info required at checkout)`}
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete !== null) remove(confirmDelete);
          setConfirmDelete(null);
        }}
        title="Delete this ticket category?"
        description="This can't be undone. If any tickets have sold, you must hide the category instead."
        confirmLabel="Delete"
      />
    </div>
  );
}

export default TicketTypeEditor;