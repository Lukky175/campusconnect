import {
  ArrowRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function DashboardEventsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Discover
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">
          Events
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          Explore hackathons, workshops, competitions and
          other technology opportunities available to
          students.
        </p>
      </section>

      {/* Temporary event area */}
      <section>
        <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-8 shadow-[var(--cc-shadow-sm)]">
          <div className="flex size-10 items-center justify-center rounded-[var(--cc-radius-md)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
            <CalendarDays className="size-5" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[var(--cc-heading)]">
            Find your next opportunity
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--cc-text-muted)]">
            The dashboard events section will show the
            latest opportunities from CampusConnect.
          </p>

          <Link
            to="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] transition hover:bg-[var(--cc-primary-hover)]"
          >
            Browse events
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Example event layout */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--cc-heading)]">
          How events will appear
        </h2>

        <div className="mt-4 rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--cc-text-muted)]">
            <span className="rounded-full bg-[var(--cc-primary-soft)] px-2.5 py-1 font-medium text-[var(--cc-primary)]">
              Hackathon
            </span>

            <span>Upcoming</span>
          </div>

          <h3 className="mt-4 font-semibold text-[var(--cc-heading)]">
            Event title
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
            Event description will be loaded from the
            CampusConnect backend.
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--cc-text-muted)]">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Event date
            </span>

            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              Event location
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}