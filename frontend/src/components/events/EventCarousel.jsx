import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../common/IconButton";
import { cn } from "../../utils/cn";

/**
 * Multi-image carousel for the event hero. Crossfades between flyers
 * with a subtle scale. Supports swipe, arrows, and dot indicators.
 */
export function EventCarousel({
  images = [],
  className,
  autoPlay = 6000,
  onIndexChange,
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1 || autoPlay === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, autoPlay);
    return () => clearInterval(id);
  }, [count, autoPlay]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  if (!count) return null;

  const go = (i) => setIndex(((i % count) + count) % count);

  return (
    <div
      className={cn("relative select-none", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Event images"
    >
      <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index].id ?? index}
            src={images[index].url}
            alt=""
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3">
            <IconButton
              label="Previous image"
              variant="subtle"
              className="bg-background/80 backdrop-blur-md border border-white/10 hover:bg-background"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton
              label="Next image"
              variant="subtle"
              className="bg-background/80 backdrop-blur-md border border-white/10 hover:bg-background"
              onClick={() => go(index + 1)}
            >
              <ChevronRight size={18} />
            </IconButton>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={index === i}
                onClick={() => go(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === i ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default EventCarousel;