import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { useSeo } from "../../hooks/useSeo";
import { APP } from "../../constants/config";
import { Ticket, Users, ShieldCheck, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Flyer-driven event pages",
    body: "Every event page takes its colours from the flyer — a premium experience that feels like the event itself.",
  },
  {
    icon: Ticket,
    title: "Instant QR tickets",
    body: "Every admission receives its own QR code. One user, one ticket, one scan — no confusion at the door.",
  },
  {
    icon: ShieldCheck,
    title: "Backend-verified payments",
    body: "Tickets are only issued after our backend confirms the payment with the provider. No fake confirmations.",
  },
  {
    icon: Users,
    title: "Built for organizers",
    body: "Sell tickets, manage scanners, monitor revenue, and see check-in activity — all in one dashboard.",
  },
];

export default function AboutPage() {
  useSeo({
    title: "About",
    description: `Learn more about ${APP.name} — the modern event platform.`,
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <PageHeader
        eyebrow="About"
        title={`Built for great events.`}
        subtitle={`${APP.name} is a modern ticketing platform for organizers, customers, and venues. Discover unforgettable events, sell tickets in minutes, and get everyone through the door faster.`}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-4">
              <Icon size={20} />
            </div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to start?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Explore events or set up your organizer account in under two minutes.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" to={ROUTES.events}>Browse events</Button>
          <Button size="lg" variant="outline" to={ROUTES.register}>
            Become an organizer
          </Button>
        </div>
      </div>
    </div>
  );
}