/**
 * Central error-code registry. Every service method returns failures
 * using these codes so the UI can switch behaviour reliably.
 *
 * The frontend never decides whether a payment or ticket is truly valid.
 * It only maps backend codes to user-facing copy.
 */

export const ERROR_CODES = Object.freeze({
  // Auth
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  WEAK_PASSWORD: "WEAK_PASSWORD",

  // Permissions
  FORBIDDEN: "FORBIDDEN",
  NOT_EVENT_ORGANIZER: "NOT_EVENT_ORGANIZER",
  NOT_EVENT_SCANNER: "NOT_EVENT_SCANNER",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  EVENT_UNPUBLISHED: "EVENT_UNPUBLISHED",
  EVENT_CANCELLED: "EVENT_CANCELLED",
  EVENT_COMPLETED: "EVENT_COMPLETED",
  TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  ORGANIZER_NOT_FOUND: "ORGANIZER_NOT_FOUND",

  // Inventory & sales
  SOLD_OUT: "SOLD_OUT",
  INSUFFICIENT_INVENTORY: "INSUFFICIENT_INVENTORY",
  SALES_NOT_STARTED: "SALES_NOT_STARTED",
  SALES_ENDED: "SALES_ENDED",
  EXCEEDS_MAX_PER_ORDER: "EXCEEDS_MAX_PER_ORDER",
  BELOW_MIN_PER_ORDER: "BELOW_MIN_PER_ORDER",
  RESERVATION_EXPIRED: "RESERVATION_EXPIRED",

  // Order
  ORDER_ALREADY_PAID: "ORDER_ALREADY_PAID",
  ORDER_EXPIRED: "ORDER_EXPIRED",
  ORDER_CANCELLED: "ORDER_CANCELLED",

  // Payments
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  PAYMENT_VERIFICATION_PENDING: "PAYMENT_VERIFICATION_PENDING",
  PAYMENT_VERIFICATION_DELAYED: "PAYMENT_VERIFICATION_DELAYED",
  PAYMENT_PROVIDER_ERROR: "PAYMENT_PROVIDER_ERROR",

  // Tickets / scanning
  TICKET_INVALID: "TICKET_INVALID",
  TICKET_ALREADY_USED: "TICKET_ALREADY_USED",
  TICKET_EXPIRED: "TICKET_EXPIRED",
  TICKET_CANCELLED: "TICKET_CANCELLED",
  TICKET_WRONG_EVENT: "TICKET_WRONG_EVENT",
  TICKET_REFUNDED: "TICKET_REFUNDED",
  TICKET_VOID: "TICKET_VOID",
  TICKET_PENDING_PAYMENT: "TICKET_PENDING_PAYMENT",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  INVALID_EMAIL: "INVALID_EMAIL",

  // Generic
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  UNKNOWN: "UNKNOWN",
});

/** Human-friendly messages for each code — used as the default UI copy. */
export const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.UNAUTHENTICATED]: "Please sign in to continue.",
  [ERROR_CODES.INVALID_CREDENTIALS]: "Incorrect email or password.",
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: "An account with this email already exists.",
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: "Please verify your email to continue.",
  [ERROR_CODES.TOKEN_EXPIRED]: "This link has expired. Please request a new one.",
  [ERROR_CODES.TOKEN_INVALID]: "This link is invalid or has already been used.",
  [ERROR_CODES.WEAK_PASSWORD]: "Password does not meet the security requirements.",

  [ERROR_CODES.FORBIDDEN]: "You don't have permission to do that.",
  [ERROR_CODES.NOT_EVENT_ORGANIZER]: "You are not an organizer of this event.",
  [ERROR_CODES.NOT_EVENT_SCANNER]: "You are not assigned to scan this event.",

  [ERROR_CODES.NOT_FOUND]: "We couldn't find what you were looking for.",
  [ERROR_CODES.EVENT_NOT_FOUND]: "This event couldn't be found.",
  [ERROR_CODES.EVENT_UNPUBLISHED]: "This event is no longer available.",
  [ERROR_CODES.EVENT_CANCELLED]: "This event has been cancelled.",
  [ERROR_CODES.EVENT_COMPLETED]: "This event has already taken place.",
  [ERROR_CODES.TICKET_NOT_FOUND]: "Ticket not found.",
  [ERROR_CODES.ORDER_NOT_FOUND]: "Order not found.",
  [ERROR_CODES.ORGANIZER_NOT_FOUND]: "Organizer not found.",

  [ERROR_CODES.SOLD_OUT]: "This ticket is sold out.",
  [ERROR_CODES.INSUFFICIENT_INVENTORY]: "Not enough tickets remaining.",
  [ERROR_CODES.SALES_NOT_STARTED]: "Ticket sales have not started yet.",
  [ERROR_CODES.SALES_ENDED]: "Ticket sales have ended.",
  [ERROR_CODES.EXCEEDS_MAX_PER_ORDER]: "You've reached the maximum quantity per order.",
  [ERROR_CODES.BELOW_MIN_PER_ORDER]: "Please select more tickets.",
  [ERROR_CODES.RESERVATION_EXPIRED]: "Your reservation expired. Please try again.",

  [ERROR_CODES.ORDER_ALREADY_PAID]: "This order has already been paid.",
  [ERROR_CODES.ORDER_EXPIRED]: "This order has expired.",
  [ERROR_CODES.ORDER_CANCELLED]: "This order was cancelled.",

  [ERROR_CODES.PAYMENT_FAILED]: "Payment failed. Please try again.",
  [ERROR_CODES.PAYMENT_CANCELLED]: "Payment was cancelled.",
  [ERROR_CODES.PAYMENT_VERIFICATION_PENDING]: "We're confirming your payment. This can take a moment.",
  [ERROR_CODES.PAYMENT_VERIFICATION_DELAYED]: "Payment verification is taking longer than usual. We'll update you shortly.",
  [ERROR_CODES.PAYMENT_PROVIDER_ERROR]: "The payment provider had a problem. Please try again.",

  [ERROR_CODES.TICKET_INVALID]: "Invalid ticket.",
  [ERROR_CODES.TICKET_ALREADY_USED]: "This ticket has already been checked in.",
  [ERROR_CODES.TICKET_EXPIRED]: "This ticket has expired.",
  [ERROR_CODES.TICKET_CANCELLED]: "This ticket has been cancelled.",
  [ERROR_CODES.TICKET_WRONG_EVENT]: "This ticket is for a different event.",
  [ERROR_CODES.TICKET_REFUNDED]: "This ticket has been refunded.",
  [ERROR_CODES.TICKET_VOID]: "This ticket is void.",
  [ERROR_CODES.TICKET_PENDING_PAYMENT]: "Payment for this ticket hasn't been confirmed yet.",

  [ERROR_CODES.VALIDATION_ERROR]: "Please check the highlighted fields.",
  [ERROR_CODES.DUPLICATE_EMAIL]: "This email appears more than once.",
  [ERROR_CODES.INVALID_EMAIL]: "Please enter a valid email address.",

  [ERROR_CODES.NETWORK_ERROR]: "Network problem. Please check your connection.",
  [ERROR_CODES.SERVER_ERROR]: "Something went wrong on our end. Please try again.",
  [ERROR_CODES.RATE_LIMITED]: "Too many attempts. Please wait a moment.",
  [ERROR_CODES.UNKNOWN]: "Something went wrong.",
});

/** Build a consistent error object used across every service. */
export function makeError(code = ERROR_CODES.UNKNOWN, message = null, extra = {}) {
  return {
    success: false,
    code,
    message: message ?? ERROR_MESSAGES[code] ?? ERROR_MESSAGES[ERROR_CODES.UNKNOWN],
    ...extra,
  };
}

/** Build a consistent success object. */
export function makeSuccess(data = null, message = null) {
  return { success: true, data, message };
}

export const isErrorCode = (err, code) => err?.code === code;