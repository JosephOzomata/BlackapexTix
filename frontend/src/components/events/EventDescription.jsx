import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export function EventDescription({ text, className, clampLines = 8 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const paragraphs = text.split(/\n+/).filter(Boolean);
  const isLong = text.length > 400;

  return (
    <div className={cn("text-[var(--event-foreground)]/90", className)}>
      <h2 className="text-lg font-bold text-[var(--event-foreground)] mb-3">
        About this event
      </h2>
      <motion.div
        initial={false}
        animate={{ height: "auto" }}
        className={cn(
          "space-y-3 text-sm leading-relaxed whitespace-pre-line",
          !expanded && isLong && "line-clamp-none"
        )}
        style={
          !expanded && isLong
            ? {
                display: "-webkit-box",
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </motion.div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-[var(--event-primary)] hover:underline inline-flex items-center gap-1"
        >
          {expanded ? "Show less" : "Show more"}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>
      )}
    </div>
  );
}

export default EventDescription;