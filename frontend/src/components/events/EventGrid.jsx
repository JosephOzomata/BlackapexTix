import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { Skeleton } from "../common/Skeleton";
import { cn } from "../../utils/cn";

export function EventGrid({ events = [], loading = false, className, columns = 4 }) {
  const cols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  if (loading) {
    return (
      <div className={cn("grid gap-5", cols, className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
            <Skeleton className="aspect-[4/5] rounded-none" />
            <div className="p-3.5 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className={cn("grid gap-5", cols, className)}
    >
      {events.map((e, i) => (
        <EventCard key={e.id} event={e} index={i} />
      ))}
    </motion.div>
  );
}

export default EventGrid;