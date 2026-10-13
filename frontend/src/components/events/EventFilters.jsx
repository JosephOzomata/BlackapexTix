import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Checkbox } from "../common/Checkbox";
import { Drawer } from "../common/Drawer";
import { IconButton } from "../common/IconButton";
import { EventCategoryChips } from "./EventCategoryChips";
import { EVENT_CATEGORIES } from "../../constants/categories";

/**
 * Full filter panel — desktop sidebar and mobile drawer.
 * Controlled by the parent (events page) via `value` and `onChange`.
 */
export function EventFiltersPanel({ value = {}, onChange, onReset, className }) {
  return (
    <div className={className}>
      <FilterGroup label="Category">
        <EventCategoryChips
          value={value.category ?? ""}
          onChange={(slug) => onChange?.({ ...value, category: slug })}
          layout="wrap"
        />
      </FilterGroup>

      <FilterGroup label="Location">
        <Input
          placeholder="City (e.g. Lagos)"
          value={value.city ?? ""}
          onChange={(e) => onChange?.({ ...value, city: e.target.value })}
        />
      </FilterGroup>

      <FilterGroup label="Date range">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="From"
            value={value.dateFrom ?? ""}
            onChange={(e) => onChange?.({ ...value, dateFrom: e.target.value })}
          />
          <Input
            type="date"
            label="To"
            value={value.dateTo ?? ""}
            onChange={(e) => onChange?.({ ...value, dateTo: e.target.value })}
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Price">
        <div className="space-y-3">
          <Checkbox
            label="Show only free events"
            checked={Boolean(value.isFree)}
            onChange={(e) => onChange?.({ ...value, isFree: e.target.checked })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Min (₦)"
              value={value.priceMin ?? ""}
              onChange={(e) => onChange?.({ ...value, priceMin: e.target.value })}
            />
            <Input
              type="number"
              label="Max (₦)"
              value={value.priceMax ?? ""}
              onChange={(e) => onChange?.({ ...value, priceMax: e.target.value })}
            />
          </div>
        </div>
      </FilterGroup>

      <Button variant="outline" onClick={onReset} className="w-full mt-2">
        Reset filters
      </Button>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="mb-6 last:mb-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {label}
      </h4>
      {children}
    </div>
  );
}

export function EventFiltersMobileDrawer({ open, onClose, value, onChange, onReset }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="bottom"
      size="full"
      title="Filters"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset} className="flex-1">
            Reset
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            Show results
          </Button>
        </div>
      }
    >
      <EventFiltersPanel value={value} onChange={onChange} onReset={onReset} />
    </Drawer>
  );
}

export default EventFiltersPanel;