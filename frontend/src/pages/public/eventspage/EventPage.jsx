import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import PublicLayout from "../../../components/layout/PublicLayout";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";


export default function EventPage() {
  const { eventId } = useParams();

  const navigate = useNavigate();

  const toast = useToast();

  const [event, setEvent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /*
   * ---------------------------------------------------------
   * Load event
   * ---------------------------------------------------------
   *
   * Backend:
   *
   * {
   *   success: true,
   *   message: "Event fetched.",
   *   data: {
   *     event: {...}
   *   }
   * }
   *
   * request.js unwraps "data".
   *
   * Therefore:
   *
   * api.getEvent(...)
   *
   * returns:
   *
   * {
   *   event: {...}
   * }
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let active = true;

    async function loadEvent() {
      try {
        setLoading(true);

        const response =
          await api.getEvent(eventId);

        console.log(
          "PUBLIC EVENT RESPONSE:",
          response
        );

        if (!active) {
          return;
        }

        setEvent(
          response?.event || null
        );

      } catch (error) {
        if (active) {
          toast.error(
            error.message ||
              "Unable to load event."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      active = false;
    };
  }, [eventId, toast]);


  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */
  if (loading) {
    return (
      <PublicLayout>

        <div className="container-page py-20">

          <div className="h-8 w-32 animate-pulse rounded bg-[var(--cc-surface-subtle)]" />

          <div className="mt-8 h-10 max-w-2xl animate-pulse rounded bg-[var(--cc-surface-subtle)]" />

        </div>

      </PublicLayout>
    );
  }


  /*
   * ---------------------------------------------------------
   * Not found
   * ---------------------------------------------------------
   */
  if (!event) {
    return (
      <PublicLayout>

        <div className="container-page py-20 text-center">

          <p className="text-sm text-[var(--cc-text-muted)]">
            This event could not be found.
          </p>

          <Link
            to="/events"
            className="mt-4 inline-block text-sm font-medium text-[var(--cc-primary)]"
          >
            Back to events
          </Link>

        </div>

      </PublicLayout>
    );
  }


  /*
   * ---------------------------------------------------------
   * Registration
   * ---------------------------------------------------------
   */
  const handleRegistration = () => {
    const authenticated =
      Boolean(
        localStorage.getItem(
          "campusconnect-auth"
        )
      );

    if (!authenticated) {
      toast.info(
        "Please sign in before registering for an event."
      );

      navigate("/login");

      return;
    }

    /*
     * Registration API will be connected later.
     */
    toast.info(
      "You are signed in. Event registration will be connected next."
    );
  };


  return (
    <PublicLayout>

      <section className="container-page py-12 md:py-16">

        {/* Back */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm text-[var(--cc-text-muted)] hover:text-[var(--cc-text)]"
        >
          <ArrowLeft className="size-4" />

          Back to events
        </Link>


        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">

          {/* =================================================
              Main
          ================================================= */}
          <div>

            <div className="flex flex-wrap items-center gap-2">

              <Badge tone="primary">
                {event.type || "Event"}
              </Badge>

              {event.mode && (
                <span className="text-sm text-[var(--cc-text-soft)]">
                  {event.mode}
                </span>
              )}

              {event.status === "published" && (
                <Badge tone="success">
                  Open
                </Badge>
              )}

            </div>


            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">
              {event.title}
            </h1>


            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--cc-text-muted)]">
              {event.description ||
                "No description available."}
            </p>


            {/* =================================================
                Metadata
            ================================================= */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              <Detail
                icon={CalendarDays}
                label="Date"
                value={formatDate(
                  event.start_date
                )}
              />

              <Detail
                icon={Clock3}
                label="Time"
                value={formatTime(
                  event.start_date
                )}
              />

              <Detail
                icon={MapPin}
                label="Location"
                value={
                  event.location ||
                  "Location not specified"
                }
              />

              <Detail
                icon={Users}
                label="Team size"
                value={formatTeamSize(
                  event.team_size
                )}
              />

            </div>


            {/* =================================================
                Event content
            ================================================= */}
            <div className="mt-10 space-y-8 border-t border-[var(--cc-border)] pt-8">

              <section>

                <h2 className="text-lg font-semibold text-[var(--cc-heading)]">
                  About this event
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--cc-text-muted)]">
                  {event.details ||
                    event.description ||
                    "No additional information available."}
                </p>

              </section>


              <section>

                <h2 className="text-lg font-semibold text-[var(--cc-heading)]">
                  Eligibility
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--cc-text-muted)]">
                  {event.eligibility ||
                    "Open to currently enrolled college and university students."}
                </p>

              </section>


              {event.highlights?.length > 0 && (
                <section>

                  <h2 className="text-lg font-semibold text-[var(--cc-heading)]">
                    What to expect
                  </h2>

                  <ul className="mt-3 space-y-3">

                    {event.highlights.map(
                      (item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex gap-3 text-sm text-[var(--cc-text-muted)]"
                        >

                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--cc-success)]" />

                          {item}

                        </li>
                      )
                    )}

                  </ul>

                </section>
              )}

            </div>

          </div>


          {/* =================================================
              Registration
          ================================================= */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">

            <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)]">

              <p className="text-xs font-medium uppercase tracking-wider text-[var(--cc-text-soft)]">
                Registration
              </p>

              <h2 className="mt-2 text-lg font-semibold text-[var(--cc-heading)]">
                Interested in participating?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
                Sign in to your CampusConnect
                account to continue with registration.
              </p>

              <Button
                className="mt-5 w-full"
                onClick={handleRegistration}
              >
                Register for event
              </Button>


              {event.organizer && (
                <div className="mt-5 border-t border-[var(--cc-border)] pt-5">

                  <p className="text-xs text-[var(--cc-text-soft)]">
                    Organizer
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--cc-text)]">
                    {event.organizer}
                  </p>

                </div>
              )}


              {event.registration_url && (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-primary)]"
                >
                  Organizer registration page

                  <ExternalLink className="size-3.5" />
                </a>
              )}

            </div>

          </aside>

        </div>

      </section>

    </PublicLayout>
  );
}


/*
 * ---------------------------------------------------------
 * Detail
 * ---------------------------------------------------------
 */
function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4">

      <Icon className="size-4 text-[var(--cc-primary)]" />

      <p className="mt-2 text-xs text-[var(--cc-text-soft)]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[var(--cc-text)]">
        {value}
      </p>

    </div>
  );
}


/*
 * ---------------------------------------------------------
 * Date
 * ---------------------------------------------------------
 */
function formatDate(value) {
  if (!value) {
    return "Date not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


/*
 * ---------------------------------------------------------
 * Time
 * ---------------------------------------------------------
 */
function formatTime(value) {
  if (!value) {
    return "Time not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time not specified";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


/*
 * ---------------------------------------------------------
 * Team size
 * ---------------------------------------------------------
 *
 * Current database:
 *
 * team_size: 5
 *
 * Also supports the future structure:
 *
 * {
 *   min: 2,
 *   max: 5
 * }
 * ---------------------------------------------------------
 */
function formatTeamSize(value) {
  if (!value) {
    return "Individual / team";
  }

  if (
    typeof value === "number"
  ) {
    return value === 1
      ? "1 member"
      : `${value} members`;
  }

  if (
    typeof value === "object" &&
    value.min != null &&
    value.max != null
  ) {
    if (
      value.min === value.max
    ) {
      return value.min === 1
        ? "1 member"
        : `${value.min} members`;
    }

    return `${value.min}-${value.max} members`;
  }

  return "Team size not specified";
}