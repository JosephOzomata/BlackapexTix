/**
 * Platform-level configuration.
 * NOTE: Only values safe to expose to the browser live here.
 * Secrets (payment keys, webhook secrets, JWT signing keys) never do.
 */

const env = (key, fallback) => {
  const v = import.meta.env?.[key];
  return v === undefined || v === "" ? fallback : v;
};

export const APP = {
  name: "TicketHub",
  shortName: "TicketHub",
  tagline: "Discover. Book. Enter.",
  description:
    "A modern platform for discovering events and selling tickets. Built for organizers, customers, and venues.",
  url: env("VITE_APP_URL", "http://localhost:5173"),
  supportEmail: env("VITE_SUPPORT_EMAIL", "support@tickethub.example"),
  supportPhone: env("VITE_SUPPORT_PHONE", "+234 000 000 0000"),
};

export const API = {
  baseUrl: env("VITE_API_BASE_URL", "/api/v1"),
  timeoutMs: Number(env("VITE_API_TIMEOUT_MS", 15_000)),
};

export const PAYMENTS = {
  // The provider name is UI-only — actual secret handling is backend-side.
  provider: env("VITE_PAYMENT_PROVIDER", "mock-pay"),
  // Public key would be exposed by backend; we never hardcode secrets.
  publicKey: env("VITE_PAYMENT_PUBLIC_KEY", ""),
  currency: "NGN",
};

export const FEES = {
  // Service fee charged on top of ticket subtotal, in percent.
  serviceFeePercent: Number(env("VITE_SERVICE_FEE_PERCENT", 5)),
  // Platform fee taken from organizer revenue, in percent.
  platformFeePercent: Number(env("VITE_PLATFORM_FEE_PERCENT", 3)),
  // Fixed fee per ticket in the smallest currency unit (kobo).
  fixedFeePerTicketKobo: Number(env("VITE_FIXED_FEE_PER_TICKET", 10000)),
};

export const CHECKOUT = {
  // Minutes the backend will hold reserved inventory for a pending order.
  reservationMinutes: Number(env("VITE_RESERVATION_MINUTES", 10)),
  // Max number of distinct ticket categories a single order can contain.
  maxCategoriesPerOrder: 10,
  // Max total quantity across all categories per order.
  maxTotalQuantityPerOrder: 20,
};

export const UPLOADS = {
  maxFlyers: 8,
  maxFileSizeMb: 8,
  acceptedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  // Simulated upload duration in ms (mock services) — replace in production.
  mockUploadDurationMs: 1400,
};

export const PAGINATION = {
  defaultPageSize: 12,
  defaultAdminPageSize: 20,
  maxPageSize: 100,
};

export const LOCALE = {
  default: "en-NG",
  currency: "NGN",
  timeZone: "Africa/Lagos",
};

export const FEATURE_FLAGS = {
  favorites: true,
  notifications: true,
  scannerOffline: false, // never enable without a real cryptographic offline strategy
  groupOrders: true,
};