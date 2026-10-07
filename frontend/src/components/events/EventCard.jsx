import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";

export default function EventCard({ event }) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] transition-shadow hover:shadow-[var(--cc-shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <Badge tone="primary">{event.type}</Badge>
        <span className="text-xs text-[var(--cc-text-soft)]">{event.mode}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--cc-heading)] group-hover:text-[var(--cc-primary)]">
        {event.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--cc-text-muted)]">{event.description}</p>

      <div className="mt-5 space-y-2 text-sm text-[var(--cc-text-muted)]">
        <div className="flex items-center gap-2"><CalendarDays className="size-4" />{event.date}</div>
        <div className="flex items-center gap-2"><MapPin className="size-4" />{event.location}</div>
        <div className="flex items-center gap-2"><Users className="size-4" />{event.audience}</div>
      </div>

      <div className="mt-auto pt-5">
        <Link
          to={`/events/${event.id}`}
          className="focus-ring inline-flex text-sm font-medium text-[var(--cc-primary)] hover:underline"
        >
          View details →
        </Link>
      </div>
    </article>
  );
}
