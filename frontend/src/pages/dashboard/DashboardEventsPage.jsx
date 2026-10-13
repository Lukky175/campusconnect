
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Trophy,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import EventCard from "../public/eventspage/EventCard";
import EmptyState from "../../components/common/EmptyState";

const CATEGORIES = [
  {
    label: "Hackathons",
    value: "Hackathon",
    description: "Build, experiment and collaborate.",
    icon: Code2,
  },
  {
    label: "Workshops",
    value: "Workshop",
    description: "Learn practical skills.",
    icon: GraduationCap,
  },
  {
    label: "Competitions",
    value: "Competition",
    description: "Challenge your abilities.",
    icon: Trophy,
  },
  {
    label: "Seminars",
    value: "Seminar",
    description: "Discover ideas and insights.",
    icon: CalendarDays,
  },
];

const FILTERS = [
  "All",
  "Hackathon",
  "Workshop",
  "Competition",
  "Seminar",
];

export default function DashboardEventsPage() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toast = useToast();

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await api.getEvents();

        if (active) {
          setEvents(
            Array.isArray(response?.events)
              ? response.events
              : []
          );
        }
      } catch (err) {
        if (active) {
          const message =
            err.message || "Unable to load events.";

          setError(message);
          toast.error(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [toast]);

  const counts = useMemo(() => {
    return CATEGORIES.reduce((result, category) => {
      result[category.value] = events.filter(
        (event) => event.type === category.value
      ).length;

      return result;
    }, {});
  }, [events]);

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesType =
        filter === "All" || event.type === filter;

      const searchableText = [
        event.title,
        event.description,
        event.details,
        event.location,
        event.college,
        event.organizer,
        ...(Array.isArray(event.tags) ? event.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesType &&
        searchableText.includes(normalizedQuery)
      );
    });
  }, [events, filter, query]);

  function selectCategory(category) {
    setFilter(category);
  }

  function clearFilters() {
    setQuery("");
    setFilter("All");
  }

  return (
    <div className="min-h-full bg-[var(--cc-bg)]">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* Page header */}
        <section className="mb-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <Link
              to="/dashboard"
              className="text-[var(--cc-text-muted)] transition-colors hover:text-[var(--cc-primary)]"
            >
              Dashboard
            </Link>

            <span className="text-[var(--cc-text-soft)]">
              /
            </span>

            <span
              aria-current="page"
              className="font-medium text-[var(--cc-heading)]"
            >
              Events
            </span>
          </nav>

          <div className="mt-3 max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">
              Explore campus events
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)] sm:text-base">
              Find hackathons, workshops, competitions and seminars. Learn, Build & connect with your
              campus community.
            </p>
          </div>
        </section>

        <div className="space-y-6 lg:space-y-6">
          {/* Browse by category */}
          <section aria-labelledby="event-categories-heading">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const selected = filter === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      selectCategory(
                        selected ? "All" : category.value
                      )
                    }
                    aria-pressed={selected}
                    className={[
                      "group rounded-[var(--cc-radius-lg)] border bg-[var(--cc-surface)] p-4 text-left shadow-[var(--cc-shadow-sm)] transition-all duration-200 sm:p-5",
                      "hover:-translate-y-0.5 hover:border-[var(--cc-primary)] hover:shadow-[var(--cc-shadow-md)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)]",
                      selected
                        ? "border-[var(--cc-primary)] ring-1 ring-[var(--cc-primary)]"
                        : "border-[var(--cc-border)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-[var(--cc-radius-md)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
                        <Icon className="size-5" />
                      </div>

                      <span className="text-2xl font-semibold tabular-nums text-[var(--cc-heading)]">
                        {loading
                          ? "—"
                          : counts[category.value] ?? 0}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-[var(--cc-heading)]">
                      {category.label}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--cc-text-muted)]">
                      {category.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-[var(--cc-primary)]">
                      <span>
                        {selected
                          ? "Selected"
                          : "Explore category"}
                      </span>

                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* All events */}
          <section aria-labelledby="all-events-heading">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2
                  id="all-events-heading"
                  className="text-lg font-semibold text-[var(--cc-heading)]"
                >
                  All events
                </h2>

                <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
                  Search opportunities or filter by event type.
                </p>
              </div>

              {!loading && !error && (
                <p
                  className="text-sm text-[var(--cc-text-muted)]"
                  aria-live="polite"
                >
                  {visibleEvents.length}{" "}
                  {visibleEvents.length === 1
                    ? "event"
                    : "events"}{" "}
                  found
                </p>
              )}
            </div>

            {/* Search and filters */}
            <div className="mt-5 rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]/70 p-3 shadow-[var(--cc-shadow-sm)] sm:p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--cc-text-soft)]" />

                  <input
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search by event, skill, college or location..."
                    aria-label="Search events"
                    className="h-11 w-full rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-bg)] pl-10 pr-4 text-sm text-[var(--cc-text)] outline-none transition placeholder:text-[var(--cc-text-soft)] focus:border-[var(--cc-focus)] focus:ring-2 focus:ring-[var(--cc-focus)]/15"
                  />
                </div>

                <div className="flex min-w-0 items-start gap-2 xl:items-center">
                  <SlidersHorizontal className="mt-2.5 hidden size-4 shrink-0 text-[var(--cc-text-muted)] sm:block xl:mt-0" />

                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="Filter events by category"
                  >
                    {FILTERS.map((item) => {
                      const selected = filter === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFilter(item)}
                          aria-pressed={selected}
                          className={[
                            "rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)]",
                            selected
                              ? "border-[var(--cc-primary)] bg-[var(--cc-primary)] text-[var(--cc-on-primary)]"
                              : "border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text-muted)] hover:border-[var(--cc-primary)] hover:text-[var(--cc-primary)]",
                          ].join(" ")}
                        >
                          {item === "All" ? "All types" : item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {(query || filter !== "All") && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cc-border)] pt-3">
                  <p className="text-xs text-[var(--cc-text-muted)]">
                    {filter !== "All"
                      ? `Category: ${filter}`
                      : "All categories"}
                    {query.trim()
                      ? ` · Search: "${query.trim()}"`
                      : ""}
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--cc-primary)] hover:underline"
                  >
                    <X className="size-3.5" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Event results */}
            {loading ? (
              <EventGridSkeleton />
            ) : error ? (
              <div className="mt-5 rounded-[var(--cc-radius-lg)] border border-[var(--cc-danger)]/30 bg-[var(--cc-danger-soft)] p-6">
                <h3 className="font-semibold text-[var(--cc-heading)]">
                  Events couldn't be loaded
                </h3>

                <p className="mt-2 text-sm text-[var(--cc-text-muted)]">
                  Check your connection and try again.
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-[var(--cc-primary)] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : visibleEvents.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleEvents.map((event) => (
                  <EventCard
                    key={event._id || event.slug}
                    event={event}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title={
                    events.length === 0
                      ? "No events available yet"
                      : "No matching events"
                  }
                  description={
                    events.length === 0
                      ? "New opportunities will appear here when events are published."
                      : "Try another keyword or category, or clear your filters."
                  }
                />

                {events.length > 0 && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-medium text-[var(--cc-primary)] hover:underline"
                    >
                      Clear search and filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EventGridSkeleton() {
  return (
    <div
      className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading events"
    >
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-80 animate-pulse rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]"
        />
      ))}
    </div>
  );
}
