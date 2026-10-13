/**
 * Route constants — used by router.jsx, nav, and links.
 * Never hardcode path strings elsewhere; import from here.
 */
export const ROUTES = Object.freeze({
  // Public
  home: "/",
  events: "/events",
  eventDetail: (slug = ":slug") => `/events/${slug}`,
  organizerPublic: (slug = ":slug") => `/organizers/${slug}`,
  about: "/about",
  contact: "/contact",

  // Auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",

  // Customer
  myTickets: "/my-tickets",
  ticketDetail: (id = ":ticketId") => `/my-tickets/${id}`,
  groupOrder: (id = ":orderId") => `/my-tickets/group/${id}`,
  orderHistory: "/orders",
  profile: "/account",

  // Checkout
  checkout: (slug = ":slug") => `/checkout/${slug}`,

  // Organizer
  organizer: {
    root: "/organizer",
    dashboard: "/organizer",
    events: "/organizer/events",
    eventNew: "/organizer/events/new",
    eventDetail: (id = ":eventId") => `/organizer/events/${id}`,
    eventEdit: (id = ":eventId") => `/organizer/events/${id}/edit`,
    eventTickets: (id = ":eventId") => `/organizer/events/${id}/tickets`,
    eventAttendees: (id = ":eventId") => `/organizer/events/${id}/attendees`,
    eventScanners: (id = ":eventId") => `/organizer/events/${id}/scanners`,
    eventAnalytics: (id = ":eventId") => `/organizer/events/${id}/analytics`,
    transactions: "/organizer/transactions",
    profile: "/organizer/profile",
  },

  // Scanner
  scanner: {
    root: "/scanner",
    home: "/scanner",
    event: (id = ":eventId") => `/scanner/events/${id}`,
  },

  // Super admin
  admin: {
    root: "/admin",
    dashboard: "/admin",
    events: "/admin/events",
    organizers: "/admin/organizers",
    users: "/admin/users",
    transactions: "/admin/transactions",
    moderation: "/admin/moderation",
  },
});