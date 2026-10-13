import { cn } from "../../utils/cn";

const TONES = {
  neutral: "bg-card-elevated text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  accent: "bg-accent/15 text-accent border-accent/30",
};

const SIZES = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1 gap-1.5",
};

export function Badge({
  tone = "neutral",
  size = "md",
  className,
  children,
  icon,
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-full whitespace-nowrap",
        TONES[tone] ?? TONES.neutral,
        SIZES[size],
        className
      )}
      {...rest}
    >
      {icon && <span className="shrink-0" aria-hidden>{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;