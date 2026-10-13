export const ROLES = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  ORGANIZER: "ORGANIZER",
  SCANNER: "SCANNER",
  CUSTOMER: "CUSTOMER",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ORGANIZER]: "Organizer",
  [ROLES.SCANNER]: "Scanner",
  [ROLES.CUSTOMER]: "Customer",
});

/** Landing route after login per role. */
export const ROLE_HOME = Object.freeze({
  [ROLES.SUPER_ADMIN]: "/admin",
  [ROLES.ORGANIZER]: "/organizer",
  [ROLES.SCANNER]: "/scanner",
  [ROLES.CUSTOMER]: "/my-tickets",
});

/** Which areas of the app each role may enter. */
export const ROLE_AREAS = Object.freeze({
  [ROLES.SUPER_ADMIN]: ["public", "customer", "organizer", "scanner", "admin"],
  [ROLES.ORGANIZER]: ["public", "customer", "organizer"],
  [ROLES.SCANNER]: ["public", "scanner"],
  [ROLES.CUSTOMER]: ["public", "customer"],
});

export const ROLE_ACCENTS = Object.freeze({
  [ROLES.SUPER_ADMIN]: "danger",
  [ROLES.ORGANIZER]: "primary",
  [ROLES.SCANNER]: "info",
  [ROLES.CUSTOMER]: "accent",
});