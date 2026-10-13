import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

/**
 * Icon-only button. Always requires an accessible label.
 */
export const IconButton = forwardRef(function IconButton(
  { label, size = "icon", variant = "ghost", className, ...rest },
  ref
) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      size={size}
      variant={variant}
      className={cn("p-0", className)}
      {...rest}
    />
  );
});

export default IconButton;