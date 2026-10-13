# Event Theme Schema

Every event may have a theme that colours its public page. The theme is
generated from the event's primary flyer by the palette engine, and may be
manually overridden by the organizer.

## Shape

```js
{
  eventId: "evt_3001",
  source: "auto" | "manual",
  primary: "#6d28d9",
  primaryForeground: "#ffffff",
  secondary: "#ec4899",
  secondaryForeground: "#ffffff",
  accent: "#f59e0b",
  accentForeground: "#0f172a",
  background: "#0a0614",
  surface: "#120a20",
  surfaceElevated: "#1a1030",
  foreground: "#f5f3ff",
  muted: "#a78bfa",
  border: "#2d1b4e",
  glow: "#8b5cf6",
  generatedFromMediaId: "media_a1b2",
  updatedAt: "2026-01-12T10:06:30.000Z"
}