import { z } from "zod";

/**
 * Shared Zod primitives reused across forms so validation stays
 * consistent. Messages are user-friendly — never leak internals.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const NG_PHONE_REGEX = /^(\+?234|0)[789][01]\d{8}$/;
export const PHONE_REGEX = /^\+?[1-9]\d{6,15}$/;

export const zEmail = z
  .string()
  .trim()
  .min(1, "Email is required")
  .regex(EMAIL_REGEX, "Please enter a valid email address")
  .transform((v) => v.toLowerCase());

export const zPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Add at least one uppercase letter")
  .regex(/[a-z]/, "Add at least one lowercase letter")
  .regex(/\d/, "Add at least one number");

export const zPhone = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (v) => NG_PHONE_REGEX.test(v.replace(/[\s-]/g, "")) || PHONE_REGEX.test(v.replace(/[\s-]/g, "")),
    "Please enter a valid phone number"
  );

export const zOptionalPhone = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || PHONE_REGEX.test(v.replace(/[\s-]/g, "")), "Please enter a valid phone number");

export const zFullName = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(100, "Name is too long")
  .regex(/^[\p{L}\p{M}'.\-\s]+$/u, "Please use letters only");

export const zUrl = z.string().trim().url("Please enter a valid URL");

export const zEventTitle = z
  .string()
  .trim()
  .min(4, "Title must be at least 4 characters")
  .max(120, "Title is too long");

export const zEventDescription = z
  .string()
  .trim()
  .min(30, "Description should be at least 30 characters")
  .max(5000, "Description is too long");

export const zCurrency = z.enum(["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"]);

/** "Quantity per order" fields on ticket types. */
export const zTicketType = z
  .object({
    name: z.string().trim().min(2, "Ticket name is required").max(60),
    price: z
      .number({ invalid_type_error: "Enter a price" })
      .int("Price must be a whole number (in kobo/cents)")
      .min(0, "Price cannot be negative"),
    quantityAvailable: z
      .number({ invalid_type_error: "Enter a quantity" })
      .int()
      .min(1, "Quantity must be at least 1"),
    minPerOrder: z.number().int().min(1).max(20),
    maxPerOrder: z.number().int().min(1).max(50),
    admits: z.number().int().min(1).max(50),
    currency: zCurrency,
  })
  .refine((t) => t.maxPerOrder >= t.minPerOrder, {
    message: "Max per order must be at least the minimum",
    path: ["maxPerOrder"],
  });

/** Type guard for Zod issues → React Hook Form error shape. */
export function zodToRHFErrors(error) {
  const out = {};
  if (!error?.issues) return out;
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!out[path]) out[path] = { type: issue.code, message: issue.message };
  }
  return out;
}

/** Debounced email list check (used by group/table purchase). */
export function dedupeEmails(emails = []) {
  const seen = new Set();
  const out = [];
  const duplicates = new Set();
  for (const raw of emails) {
    const e = String(raw ?? "").trim().toLowerCase();
    if (!e) continue;
    if (seen.has(e)) {
      duplicates.add(e);
      continue;
    }
    seen.add(e);
    out.push(e);
  }
  return { unique: out, duplicates: Array.from(duplicates) };
}