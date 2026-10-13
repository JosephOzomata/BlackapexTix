# Backend Contract — TicketHub

This document is the authoritative reference for the backend team. It defines every
entity the frontend expects, the fields each entity exposes, and the relationships
between them. Where the frontend currently uses mock data, this file states the
canonical shape that must be returned by the real API.

> **Trust note.** The frontend never decides whether a payment succeeded, whether a
> ticket is valid, or whether a user has permission. All of those decisions are made
> by the backend and communicated to the frontend through the status fields described
> below.

---

## 1. Identifier conventions

All primary keys are opaque strings. Suggested prefixes (informational only — clients
must treat them as opaque):

| Entity            | Prefix  | Example             |
|-------------------|---------|---------------------|
| User              | `usr_`  | `usr_1001`          |
| OrganizerProfile  | `org_`  | `org_2001`          |
| Event             | `evt_`  | `evt_3001`          |
| EventMedia        | `media_`| `media_a1b2`        |
| TicketType        | `tt_`   | `tt_4001`           |
| Order             | `ord_`  | `ord_5001`          |
| OrderItem         | `oi_`   | `oi_1`              |
| Ticket            | `tkt_`  | `tkt_6001`          |
| Payment           | `pay_`  | `pay_7001`          |
| Transaction       | `tx_`   | `tx_9001`           |
| ScannerAssignment | `scn_`  | `scn_9001`          |
| TicketCheckIn     | `ci_`   | `ci_1`              |
| Notification      | `ntf_`  | `ntf_8001`          |
| Refund            | `rfd_`  | `rfd_1`             |
| PlatformFee       | `fee_`  | `fee_1`             |
| AuditLog          | `log_`  | `log_1`             |

All timestamps are ISO-8601 UTC strings (`2026-02-14T18:00:00.000Z`).

All monetary amounts are integers in the currency's smallest unit. For NGN this is
**kobo** (`₦15,000` = `1500000`).

---

## 2. User

```js
{
  id: "usr_1001",
  fullName: "Amaka Obi",
  email: "amaka@example.com",
  phone: "+2348012345678",         // nullable
  avatarUrl: null,                 // nullable
  role: "SUPER_ADMIN" | "ORGANIZER" | "SCANNER" | "CUSTOMER",
  emailVerified: true,
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "DELETED",
  createdAt: "2025-06-01T10:00:00.000Z",
  updatedAt: "2025-06-01T10:00:00.000Z"
}