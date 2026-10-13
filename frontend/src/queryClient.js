import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client.
 * Sensible defaults for a public event platform:
 *  - events list changes slowly  → 60s stale time
 *  - tickets/orders change fast  → refetch on focus, shorter stale time
 * Individual queries override these where appropriate.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on auth / validation errors
        const status = error?.status ?? error?.code;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Centralised query keys — prevents cache-key typos across the app. */
export const queryKeys = {
  me: ["me"],
  notifications: ["notifications"],
  events: {
    all: ["events"],
    list: (filters) => ["events", "list", filters],
    detail: (slug) => ["events", "detail", slug],
    featured: ["events", "featured"],
    trending: ["events", "trending"],
    upcoming: ["events", "upcoming"],
  },
  organizer: {
    dashboard: ["organizer", "dashboard"],
    events: (filters) => ["organizer", "events", filters],
    event: (id) => ["organizer", "event", id],
    attendees: (id, filters) => ["organizer", "event", id, "attendees", filters],
    scanners: (id) => ["organizer", "event", id, "scanners"],
    transactions: (id, filters) => ["organizer", "event", id, "transactions", filters],
    analytics: (id, range) => ["organizer", "event", id, "analytics", range],
  },
  customer: {
    tickets: (filter) => ["customer", "tickets", filter],
    ticket: (id) => ["customer", "ticket", id],
    groupOrder: (id) => ["customer", "group-order", id],
    orders: ["customer", "orders"],
  },
  scanner: {
    assignedEvents: ["scanner", "events"],
    event: (id) => ["scanner", "event", id],
    recentCheckins: (id) => ["scanner", "event", id, "recent"],
  },
  admin: {
    overview: ["admin", "overview"],
    organizers: (filters) => ["admin", "organizers", filters],
    users: (filters) => ["admin", "users", filters],
    events: (filters) => ["admin", "events", filters],
    transactions: (filters) => ["admin", "transactions", filters],
  },
};