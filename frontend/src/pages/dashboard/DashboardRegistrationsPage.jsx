import {
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function DashboardRegistrationsPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Participation
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">
          My Registrations
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          View and manage the events you have registered
          for.
        </p>
      </section>

      <section className="rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
          <ClipboardCheck className="size-6" />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[var(--cc-heading)]">
          No registrations yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--cc-text-muted)]">
          When you register for an event, your
          registration details will appear here.
        </p>

        <Link
          to="/dashboard/events"
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] transition hover:bg-[var(--cc-primary-hover)]"
        >
          Explore events
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}