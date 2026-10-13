import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Globe, Mail, Phone, BadgeCheck, Instagram, Twitter } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { EventGrid } from "../../components/events/EventGrid";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";
import { organizersService } from "../../services/organizers.service";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";

export default function OrganizerPublicPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["organizer-public", slug],
    queryFn: () => organizersService.getPublicProfile(slug),
  });

  const organizer = data?.data?.organizer;
  const upcoming = data?.data?.upcoming ?? [];
  const past = data?.data?.past ?? [];

  useSeo({
    title: organizer?.businessName ?? "Organizer",
    description: organizer?.description,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !organizer) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn't find this organizer.
        </p>
        <Button className="mt-4" to={ROUTES.events}>Browse events</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-card-elevated overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {organizer.logoUrl ? (
              <img src={organizer.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              organizer.businessName?.[0] ?? "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {organizer.businessName}
              </h1>
              {organizer.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[11px] font-bold">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>
            {organizer.description && (
              <p className="mt-2 text-sm text-muted-foreground text-pretty max-w-2xl">
                {organizer.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {organizer.contactEmail && (
                <a href={`mailto:${organizer.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Mail size={12} /> {organizer.contactEmail}
                </a>
              )}
              {organizer.contactPhone && (
                <a href={`tel:${organizer.contactPhone}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Phone size={12} /> {organizer.contactPhone}
                </a>
              )}
              {organizer.website && (
                <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <Globe size={12} /> Website
                </a>
              )}
              {organizer.social?.instagram && (
                <span className="inline-flex items-center gap-1.5">
                  <Instagram size={12} /> {organizer.social.instagram}
                </span>
              )}
              {organizer.social?.twitter && (
                <span className="inline-flex items-center gap-1.5">
                  <Twitter size={12} /> {organizer.social.twitter}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-extrabold tracking-tight mb-5">
          Upcoming events
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming events right now.
            </p>
          </div>
        ) : (
          <EventGrid events={upcoming} columns={4} />
        )}
      </div>

      {past.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-5">
            Past events
          </h2>
          <EventGrid events={past} columns={4} />
        </div>
      )}
    </div>
  );
}