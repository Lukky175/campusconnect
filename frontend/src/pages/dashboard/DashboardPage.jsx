import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Student workspace
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)] md:text-3xl">
          Welcome back, {firstName}.
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          Discover opportunities, keep track of your
          registrations and manage your CampusConnect
          profile from one place.
        </p>
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          icon={CalendarDays}
          title="Discover events"
          description="Find hackathons, workshops, competitions and other campus opportunities."
          to="/dashboard/events"
          action="Explore events"
        />

        <DashboardCard
          icon={ClipboardCheck}
          title="My registrations"
          description="View the events you have registered for and keep track of your participation."
          to="/dashboard/registrations"
          action="View registrations"
        />

        <DashboardCard
          icon={Sparkles}
          title="Complete your profile"
          description="Keep your academic and personal information up to date."
          to="/dashboard/profile"
          action="View profile"
        />
      </section>

      {/* Upcoming section */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--cc-heading)]">
              Upcoming
            </h2>

            <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
              Your upcoming activity will appear here.
            </p>
          </div>

          <Link
            to="/dashboard/events"
            className="hidden items-center gap-1 text-sm font-medium text-[var(--cc-primary)] hover:underline sm:flex"
          >
            Browse events
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-4 rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] p-8 text-center">
          <CalendarDays className="mx-auto size-8 text-[var(--cc-text-soft)]" />

          <h3 className="mt-3 text-sm font-semibold text-[var(--cc-heading)]">
            Nothing scheduled yet
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-[var(--cc-text-muted)]">
            Once you register for events, your upcoming
            participation will be shown here.
          </p>

          <Link
            to="/dashboard/events"
            className="mt-5 inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] transition hover:bg-[var(--cc-primary-hover)]"
          >
            Explore events
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  icon: Icon,
  title,
  description,
  to,
  action,
}) {
  return (
    <Link
      to={to}
      className="group rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-md)]"
    >
      <div className="flex size-10 items-center justify-center rounded-[var(--cc-radius-md)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
        <Icon className="size-5" />
      </div>

      <h3 className="mt-5 font-semibold text-[var(--cc-heading)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-1 text-sm font-medium text-[var(--cc-primary)]">
        {action}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}