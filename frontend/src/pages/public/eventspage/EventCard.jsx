import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import Badge from "../../../components/common/Badge";

export default function EventCard({ event, dashboard = false }) {
  if (!event) return null;

  const eventIdentifier = event.slug || event._id;

  const eventPath = dashboard
    ? `/dashboard/events/${encodeURIComponent(eventIdentifier)}`
    : `/events/${encodeURIComponent(eventIdentifier)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--cc-shadow-md)]">
      <div className="h-1.5 bg-[var(--cc-primary)]" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge tone="primary">{event.type || "Event"}</Badge>

          {event.mode && (
            <span className="text-xs text-[var(--cc-text-soft)]">
              {event.mode}
            </span>
          )}
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-[var(--cc-heading)]">
          {event.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--cc-text-muted)]">
          {event.description || "No description available."}
        </p>

        <div className="mt-5 space-y-2.5 text-sm text-[var(--cc-text-muted)]">
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-[var(--cc-primary)]" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          {event.location && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--cc-primary)]" />
              <span className="line-clamp-2">{event.location}</span>
            </div>
          )}

          {event.team_size && (
            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 size-4 shrink-0 text-[var(--cc-primary)]" />
              <span>{formatTeamSize(event.team_size)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-[var(--cc-border)] pt-4">
          <Link
            to={eventPath}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--cc-primary)] hover:text-[var(--cc-primary-hover)]"
          >
            View details
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "Date not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTeamSize(value) {
  if (typeof value === "object" && value !== null) {
    if (value.min != null && value.max != null) {
      return value.min === value.max
        ? `${value.min} ${value.min === 1 ? "member" : "members"}`
        : `${value.min}-${value.max} members`;
    }

    return "Team size not specified";
  }

  const size = Number(value);

  if (!Number.isFinite(size) || size <= 0) {
    return "Team size not specified";
  }

  return `${size} ${size === 1 ? "member" : "members"}`;
}
