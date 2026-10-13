import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Button primitive. Renders <button> by default; supports `as`={Link}
 * or `to` for internal links. Full keyboard + a11y support.
 *
 * Variants: primary | secondary | outline | ghost | danger | success | subtle
 * Sizes:    sm | md | lg | xl | icon | icon-sm | icon-lg
 */
const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-card hover:border-foreground/30",
  ghost:
    "bg-transparent text-foreground hover:bg-card/70 active:bg-card",
  subtle:
    "bg-card text-card-foreground hover:bg-card-elevated border border-border",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm",
  success:
    "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
  link:
    "bg-transparent text-primary underline-offset-4 hover:underline px-0 py-0",
};

const SIZES = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-md gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2",
  xl: "h-14 px-8 text-base font-semibold rounded-lg gap-2.5",
  icon: "h-10 w-10 rounded-md",
  "icon-sm": "h-8 w-8 rounded-md",
  "icon-lg": "h-12 w-12 rounded-lg",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    className,
    children,
    as,
    to,
    href,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    type = "button",
    ...rest
  },
  ref
) {
  const Component = as === "a" || href ? "a" : to ? Link : as ?? "button";
  const isDisabled = disabled || loading;

  const classes = cn(
    "inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const props = {
    ref,
    className: classes,
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
  };

  if (Component === "button") {
    props.type = type;
    props.disabled = isDisabled;
  } else if (Component === Link) {
    props.to = to;
    if (isDisabled) {
      props.onClick = (e) => e.preventDefault();
      props.tabIndex = -1;
    }
  } else if (Component === "a") {
    props.href = href;
    if (isDisabled) {
      props.onClick = (e) => e.preventDefault();
      props.tabIndex = -1;
    }
  }

  return (
    <Component {...props} {...rest}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Component>
  );
});

export const MotionButton = motion(Button);
export default Button;