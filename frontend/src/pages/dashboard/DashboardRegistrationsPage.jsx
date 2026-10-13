import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Search,
  Ticket,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { registrationApi } from "../../services/api/registrations/registrationApi";

const getPayload = (response) => response?.data ?? response ?? {};

const getEvent = (registration) =>
  registration?.event ?? registration?.event_details ?? {};

const getRegistrationId = (registration) =>
  registration?._id ?? registration?.id ?? "";

const getStatus = (registration) =>
  String(registration?.status ?? "registered").toLowerCase();

const formatDate = (value) => {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date to be announced";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Use the existing design tokens instead of hardcoded colors.
const getStatusClasses = (status) => {
  switch (status) {
    case "registered":
      return "bg-[var(--cc-success-soft)] text-[var(--cc-success)]";

    case "confirmed":
      return "bg-[var(--cc-info-soft)] text-[var(--cc-info)]";

    case "pending":
      return "bg-[var(--cc-warning-soft)] text-[var(--cc-warning)]";

    case "cancelled":
    case "rejected":
      return "bg-[var(--cc-surface-subtle)] text-[var(--cc-text-muted)]";

    default:
      return "bg-[var(--cc-surface-subtle)] text-[var(--cc-text-muted)]";
  }
};

function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-[var(--cc-border)] ${getStatusClasses(
        status
      )}`}
    >
      {label}
    </span>
  );
}

const inputClasses =
  "w-full rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)] outline-none transition focus:border-[var(--cc-focus)] focus:ring-2 focus:ring-[var(--cc-focus)]/20";

const secondaryButtonClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-4 py-2.5 text-sm font-medium text-[var(--cc-text)] transition hover:bg-[var(--cc-surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)] disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--cc-on-primary)] transition hover:bg-[var(--cc-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--cc-bg)]";

export default function DashboardRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState("");

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await registrationApi.getMyRegistrations();
      const payload = getPayload(response);

      const items = Array.isArray(payload)
        ? payload
        : payload.registrations ?? [];

      setRegistrations(items);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load your registrations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const event = getEvent(registration);
      const status = getStatus(registration);

      const matchesFilter = filter === "all" || status === filter;

      const matchesSearch =
        !query ||
        String(event.title ?? event.name ?? "")
          .toLowerCase()
          .includes(query) ||
        String(event.type ?? event.category ?? "")
          .toLowerCase()
          .includes(query) ||
        String(event.venue ?? event.location ?? "")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [registrations, search, filter]);

  const handleCancel = async (registration) => {
    const registrationId = getRegistrationId(registration);

    if (!registrationId) {
      setError("This registration is missing its ID. Please refresh.");
      return;
    }

    const event = getEvent(registration);
    const eventName = event.title ?? event.name ?? "this event";

    const confirmed = window.confirm(
      `Are you sure you want to cancel your registration for "${eventName}"?`
    );

    if (!confirmed) return;

    setCancellingId(registrationId);
    setError("");

    try {
      await registrationApi.cancelRegistration(registrationId);

      // Update the UI only after the backend confirms cancellation.
      setRegistrations((current) =>
        current.map((item) =>
          getRegistrationId(item) === registrationId
            ? { ...item, status: "cancelled" }
            : item
        )
      );
    } catch (err) {
      setError(
        err?.message ||
          "Could not cancel the registration. Please try again."
      );
    } finally {
      setCancellingId("");
    }
  };

  const activeCount = registrations.filter(
    (item) => !["cancelled", "rejected"].includes(getStatus(item))
  ).length;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 text-[var(--cc-text)] sm:p-6 lg:p-8">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-2 text-sm text-[var(--cc-text-muted)]"
          >
            <Link
              to="/dashboard"
              className="transition hover:text-[var(--cc-primary)]"
            >
              Dashboard
            </Link>

            <span aria-hidden="true">/</span>

            <span className="font-medium text-[var(--cc-heading)]">
              My Registrations
            </span>
          </nav>

          <p className="text-sm font-medium text-[var(--cc-primary)]">
            CampusConnect
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--cc-heading)] sm:text-3xl">
            My Registrations
          </h1>

          <p className="mt-2 text-sm text-[var(--cc-text-muted)]">
            View and manage the events you have registered for.
          </p>
        </div>

        <Link to="/dashboard/events" className={primaryButtonClasses}>
          <Ticket size={17} />
          Browse events
        </Link>
      </header>

      {/* Registration metrics */}
      <section
        aria-label="Registration statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <article className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)]">
          <p className="text-sm text-[var(--cc-text-muted)]">
            Total registrations
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--cc-heading)]">
            {registrations.length}
          </p>
        </article>

        <article className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)]">
          <p className="text-sm text-[var(--cc-text-muted)]">
            Active registrations
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--cc-success)]">
            {activeCount}
          </p>
        </article>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-[var(--cc-radius-md)] border border-[var(--cc-danger)]/30 bg-[var(--cc-danger-soft)] p-4 text-sm text-[var(--cc-danger)]"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-1 transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)]"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Search and filters */}
      <section
        aria-label="Search and filter registrations"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--cc-text-soft)]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your registrations..."
            aria-label="Search registrations"
            className={`${inputClasses} py-2.5 pl-10 pr-4 text-sm`}
          />
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className={`${inputClasses} px-4 py-2.5 text-sm sm:w-48`}
          aria-label="Filter registrations by status"
        >
          <option value="all">All statuses</option>
          <option value="registered">Registered</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          type="button"
          onClick={loadRegistrations}
          disabled={loading}
          className={secondaryButtonClasses}
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh
        </button>
      </section>

      {/* Registration list */}
      {loading ? (
        <div
          role="status"
          className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-6 py-14 text-center"
        >
          <RefreshCw
            className="mx-auto animate-spin text-[var(--cc-primary)]"
            size={28}
            aria-hidden="true"
          />

          <p className="mt-3 text-sm text-[var(--cc-text-muted)]">
            Loading your registrations...
          </p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
            <Ticket size={25} aria-hidden="true" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[var(--cc-heading)]">
            {registrations.length === 0
              ? "No registrations yet"
              : "No matching registrations"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--cc-text-muted)]">
            {registrations.length === 0
              ? "When you register for an event, it will appear here."
              : "Try changing your search or status filter."}
          </p>

          {registrations.length === 0 && (
            <Link
              to="/dashboard/events"
              className={`${primaryButtonClasses} mt-5`}
            >
              Explore events
            </Link>
          )}
        </div>
      ) : (
        <section
          aria-label="Your registrations"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {filteredRegistrations.map((registration) => {
            const event = getEvent(registration);
            const status = getStatus(registration);
            const registrationId = getRegistrationId(registration);
            const eventId =
              event._id ?? event.id ?? registration.event_id ?? "";

            const title = event.title ?? event.name ?? "Untitled event";
            const eventDate =
              event.start_date ?? event.date ?? event.event_date;

            const canCancel = ![
              "cancelled",
              "rejected",
              "completed",
            ].includes(status);

            return (
              <article
                key={registrationId || `${eventId}-${title}`}
                className="flex flex-col rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] transition hover:shadow-[var(--cc-shadow-md)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-primary)]">
                      {event.type ?? event.category ?? "Event"}
                    </p>

                    <h2 className="mt-1 break-words text-lg font-bold text-[var(--cc-heading)]">
                      {title}
                    </h2>
                  </div>

                  <StatusBadge status={status} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-[var(--cc-text-muted)]">
                  <p className="flex items-center gap-2">
                    <CalendarDays
                      size={16}
                      className="shrink-0 text-[var(--cc-primary)]"
                      aria-hidden="true"
                    />
                    {formatDate(eventDate)}
                  </p>

                  {registration.registered_at && (
                    <p className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="shrink-0 text-[var(--cc-primary)]"
                        aria-hidden="true"
                      />
                      Registered on {formatDate(registration.registered_at)}
                    </p>
                  )}

                  {(event.venue || event.location) && (
                    <p className="break-words">
                      Location: {event.venue ?? event.location}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--cc-border)] pt-4">
                  {eventId && (
                    <Link
                      to={`/dashboard/events/${encodeURIComponent(event.slug ?? eventId)}`}
                    >
                      View event
                    </Link>
                  )}

                  <div className="flex-1" />

                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancel(registration)}
                      disabled={
                        !registrationId || cancellingId === registrationId
                      }
                      className="inline-flex items-center justify-center rounded-[var(--cc-radius-md)] border border-[var(--cc-danger)]/40 px-3 py-2 text-sm font-medium text-[var(--cc-danger)] transition hover:bg-[var(--cc-danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === registrationId
                        ? "Cancelling..."
                        : "Cancel registration"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}