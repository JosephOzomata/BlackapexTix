import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "md",
}) {
  const pad = { sm: "py-8", md: "py-14", lg: "py-20" }[size];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center text-center",
        pad,
        className
      )}
    >
      {icon && (
        <span className="h-14 w-14 rounded-2xl bg-card-elevated border border-border flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </span>
      )}
      {title && (
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      )}
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;