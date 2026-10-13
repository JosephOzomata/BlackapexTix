import { cn } from "../../utils/cn";

/**
 * Wrapper for react-hook-form-controlled fields. It passes label/error
 * down and provides consistent spacing. The actual input component is
 * chosen by the caller.
 */
export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  htmlFor,
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default FormField;