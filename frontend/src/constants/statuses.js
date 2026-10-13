/**
 * Canonical status constants + labels + tone mapping.
 * The backend contract in docs/ uses these exact string values.
 */

export const EVENT_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
  SALES_LIVE: "SALES_LIVE",
  SALES_ENDED: "SALES_ENDED",
  SOLD_OUT: "SOLD_OUT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  UNPUBLISHED: "UNPUBLISHED",
});

export const EVENT_STATUS_LABELS = Object.freeze({
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  SALES_LIVE: "Sales Live",
  SALES_ENDED: "Sales Ended",
  SOLD_OUT: "Sold Out",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  UNPUBLISHED: "Unpublished",
});

export const EVENT_STATUS_TONE = Object.freeze({
  DRAFT: "neutral",
  SCHEDULED: "info",
  PUBLISHED: "success",
  SALES_LIVE: "success",
  SALES_ENDED: "warning",
  SOLD_OUT: "danger",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  UNPUBLISHED: "warning",
});

export const TICKET_TYPE_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  SOLD_OUT: "SOLD_OUT",
  ENDED: "ENDED",
  HIDDEN: "HIDDEN",
});

export const TICKET_STATUS = Object.freeze({
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  VALID: "VALID",
  CHECKED_IN: "CHECKED_IN",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  VOID: "VOID",
});

export const TICKET_STATUS_LABELS = Object.freeze({
  PENDING_PAYMENT: "Pending Payment",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  VALID: "Valid",
  CHECKED_IN: "Checked In",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  VOID: "Void",
});

export const TICKET_STATUS_TONE = Object.freeze({
  PENDING_PAYMENT: "warning",
  PAYMENT_CONFIRMED: "info",
  VALID: "success",
  CHECKED_IN: "success",
  EXPIRED: "neutral",
  CANCELLED: "danger",
  REFUNDED: "warning",
  VOID: "neutral",
});

export const ORDER_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  PAID: "PAID",
  FULFILLED: "FULFILLED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
});

export const ORDER_STATUS_LABELS = Object.freeze({
  DRAFT: "Draft",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_PROCESSING: "Processing Payment",
  AWAITING_VERIFICATION: "Awaiting Verification",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
});

export const ORDER_STATUS_TONE = Object.freeze({
  DRAFT: "neutral",
  AWAITING_PAYMENT: "warning",
  PAYMENT_PROCESSING: "info",
  AWAITING_VERIFICATION: "info",
  PAID: "success",
  FULFILLED: "success",
  FAILED: "danger",
  CANCELLED: "danger",
  EXPIRED: "neutral",
  REFUNDED: "warning",
  PARTIALLY_REFUNDED: "warning",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  INITIATED: "INITIATED",
  PROCESSING: "PROCESSING",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  VERIFICATION_DELAYED: "VERIFICATION_DELAYED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
});

export const PAYMENT_STATUS_LABELS = Object.freeze({
  PENDING: "Pending",
  INITIATED: "Initiated",
  PROCESSING: "Processing",
  AWAITING_VERIFICATION: "Awaiting Verification",
  CONFIRMED: "Confirmed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  VERIFICATION_DELAYED: "Verification Delayed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
});

export const PAYMENT_STATUS_TONE = Object.freeze({
  PENDING: "neutral",
  INITIATED: "info",
  PROCESSING: "info",
  AWAITING_VERIFICATION: "info",
  CONFIRMED: "success",
  FAILED: "danger",
  CANCELLED: "danger",
  VERIFICATION_DELAYED: "warning",
  EXPIRED: "neutral",
  REFUNDED: "warning",
});

export const ORGANIZER_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  VERIFIED: "VERIFIED",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
});

export const USER_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
});

export const SCANNER_ASSIGNMENT_STATUS = Object.freeze({
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
  REVOKED: "REVOKED",
});

export const REFUND_STATUS = Object.freeze({
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
});