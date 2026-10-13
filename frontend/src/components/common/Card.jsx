import { cn } from "../../utils/cn";

export function Card({ as: As = "div", className, children, ...rest }) {
  return (
    <As
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

export function CardHeader({ title, subtitle, actions, className, icon }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5 pb-3", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="h-9 w-9 rounded-lg bg-card-elevated flex items-center justify-center text-primary shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5 pt-0", className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn("border-t border-border p-4 flex items-center justify-end gap-2", className)}>
      {children}
    </div>
  );
}

export default Card;