import { Compass, Search, Filter } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { Button } from "../common/Button";

export function EventEmptyState({ variant = "no-results", onReset, query }) {
  if (variant === "no-events") {
    return (
      <EmptyState
        icon={<Compass size={26} />}
        title="No upcoming events yet"
        description="Check back soon — new events are added regularly."
      />
    );
  }
  if (variant === "no-search") {
    return (
      <EmptyState
        icon={<Search size={26} />}
        title={query ? `No results for "${query}"` : "Start your search"}
        description="Try a different keyword, city, or category."
      />
    );
  }
  return (
    <EmptyState
      icon={<Filter size={26} />}
      title="No events match your filters"
      description="Try widening your search — remove a filter or two."
      action={
        onReset && (
          <Button variant="outline" onClick={onReset}>
            Clear filters
          </Button>
        )
      }
    />
  );
}

export default EventEmptyState;