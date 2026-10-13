/** Convert a string into a URL-safe slug. */
export function slugify(input) {
  if (!input) return "";
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ensure slug uniqueness against an existing set. */
export function uniqueSlug(base, existing = []) {
  const slug = slugify(base);
  if (!slug) return `event-${Date.now()}`;
  if (!existing.includes(slug)) return slug;
  let i = 2;
  while (existing.includes(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export default slugify;