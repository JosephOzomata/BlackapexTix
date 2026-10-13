/**
 * Canonical REST endpoints the frontend expects. Kept in one place so
 * the backend-contract doc and the actual service layer stay in sync.
 */

export const ENDPOINTS = Object.freeze({
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    me: "/auth/me",
  },
  events: {
    list: "/events",
    detail: (slug) => `/events/${slug}`,
    featured: "/events/featured",
    trending: "/events/trending",
    upcoming: "/events/upcoming",
    cities: "/events/cities",
  },
  organizers: {
    public: (slug) => `/organizers/${slug}`,
    events: (slug) => `/organizers/${slug}/events`,
  },
  organizer: {
    events: "/organizer/events",
    event: (id) => `/organizer/events/${id}`,
    publish: (id) => `/organizer/events/${id}/publish`,
    unpublish: (id) => `/organizer/events/${id}/unpublish`,
    duplicate: (id) => `/organizer/events/${id}/duplicate`,
    cancel: (id) => `/organizer/events/${id}/cancel`,
    media: (id) => `/organizer/events/${id}/media`,
    theme: (id) => `/organizer/events/${id}/theme`,
    ticketTypes: (id) => `/organizer/events/${id}/ticket-types`,
    ticketType: (id, ticketTypeId) =>
      `/organizer/events/${id}/ticket-types/${ticketTypeId}`,
    attendees: (id) => `/organizer/events/${id}/attendees`,
    scanners: (id) => `/organizer/events/${id}/scanners`,
    scanner: (id, scannerId) =>
      `/organizer/events/${id}/scanners/${scannerId}`,
    transactions: (id) => `/organizer/events/${id}/transactions`,
    analytics: (id) => `/organizer/events/${id}/analytics`,
    dashboard: "/organizer/dashboard",
    profile: "/organizer/profile",
  },
  orders: {
    create: "/orders",
    detail: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`,
    mine: "/me/orders",
  },
  payments: {
    initialize: "/payments/initialize",
    status: (orderId) => `/payments/${orderId}/status`,
    cancel: (orderId) => `/payments/${orderId}/cancel`,
  },
  tickets: {
    mine: "/me/tickets",
    detail: (id) => `/me/tickets/${id}`,
    download: (id) => `/me/tickets/${id}/download`,
    groupOrder: (orderId) => `/me/orders/${orderId}/tickets`,
  },
  scanner: {
    assignedEvents: "/scanner/events",
    event: (id) => `/scanner/events/${id}`,
    validate: (id) => `/scanner/events/${id}/validate`,
    redeem: (id) => `/scanner/events/${id}/redeem`,
    recentCheckins: (id) => `/scanner/events/${id}/checkins`,
  },
  customers: {
    checkAccounts: "/customers/check-accounts",
    profile: "/me/profile",
  },
  notifications: {
    list: "/me/notifications",
    markRead: (id) => `/me/notifications/${id}/read`,
    markAllRead: "/me/notifications/read-all",
  },
  admin: {
    overview: "/admin/overview",
    organizers: "/admin/organizers",
    organizer: (id) => `/admin/organizers/${id}`,
    users: "/admin/users",
    user: (id) => `/admin/users/${id}`,
    events: "/admin/events",
    event: (id) => `/admin/events/${id}`,
    transactions: "/admin/transactions",
    moderation: "/admin/moderation",
  },
});

export default ENDPOINTS;