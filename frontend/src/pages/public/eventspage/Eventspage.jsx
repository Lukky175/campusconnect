import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import PublicLayout from "../../../components/layout/PublicLayout";
import EmptyState from "../../../components/common/EmptyState";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

import EventFilters from "./EventFilters";
import EventCard from "./EventCard";
import Seo from "../../../components/common/Seo";
import Breadcrumbs from "../../../components/common/Breadcrumbs";

const pageCopy = {
  All: {
    title: "Technical events for college students",
    heading: "Events worth showing up for.",
    description: "Browse hackathons, workshops, coding competitions and technology events for university students in India.",
    path: "/events",
  },
  Hackathon: {
    title: "College hackathons in India",
    heading: "College hackathons in India",
    description: "Find student hackathons, check upcoming dates and deadlines, and discover opportunities to build with a team.",
    path: "/hackathons",
  },
  Workshop: {
    title: "AI workshops for college students",
    heading: "AI and technology workshops for students",
    description: "Discover AI, coding and technical workshops for college students, with practical details about dates, format and eligibility.",
    path: "/workshops",
  },
  Competition: {
    title: "Coding competitions for college students",
    heading: "Coding competitions for college students",
    description: "Explore coding and technology competitions for college students, including eligibility, formats and registration details.",
    path: "/competitions",
  },
};

export default function Eventspage({ category = "All" } = {}) {
  const copy = pageCopy[category] || pageCopy.All;
  const [events, setEvents] = useState([]);

  const [filter, setFilter] = useState(category);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const toast = useToast();


  /*
   * ---------------------------------------------------------
   * Load published events
   * ---------------------------------------------------------
   *
   * Backend returns:
   *
   * {
   *   success: true,
   *   message: "Events fetched.",
   *   data: {
   *     events: [...]
   *   }
   * }
   *
   * request.js unwraps data:
   *
   * return data?.data ?? data;
   *
   * Therefore api.getEvents() returns:
   *
   * {
   *   events: [...]
   * }
   *
   * So we use:
   *
   * response.events
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);

        const response =
          await api.getEvents();

        console.log(
          "PUBLIC EVENTS RESPONSE:",
          response
        );

        if (!active) {
          return;
        }

        setEvents(
          response?.events || []
        );

      } catch (error) {
        if (active) {
          toast.error(
            error.message ||
              "Unable to load events."
          );
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


  /*
   * ---------------------------------------------------------
   * Search + category filtering
   * ---------------------------------------------------------
   */
  const visibleEvents = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesType =
        filter === "All" ||
        event.type === filter;

      const searchableText = [
        event.title,
        event.description,
        event.location,
        event.college,
        event.organizer,
        ...(event.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(
          normalizedQuery
        );

      return (
        matchesType &&
        matchesSearch
      );
    });
  }, [
    events,
    filter,
    query,
  ]);


  return (
    <PublicLayout>
      <Seo
        title={copy.title}
        description={copy.description}
        path={copy.path}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: copy.title,
          description: copy.description,
          url: "https://campusconect.online" + copy.path,
        }}
      />
      <Breadcrumbs
        items={category === "All"
          ? [{ label: "Home", to: "/" }]
          : [{ label: "Home", to: "/" }, { label: "Events", to: "/events" }]}
        current={category === "All" ? "Events" : copy.heading}
      />

      {/* =====================================================
          Header
      ===================================================== */}
      <section className="border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">

        <div className="container-page py-14 md:py-20">

          <div className="max-w-3xl">

            <p className="text-sm font-medium text-[var(--cc-primary)]">
              Discover
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">
              {copy.heading}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)] sm:text-base">
              {copy.description}
            </p>

          </div>


          <div className="mt-9">

            <EventFilters
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
            />

          </div>

        </div>

      </section>


      <nav className="container-page flex flex-wrap gap-3 pt-7 text-sm" aria-label="Browse event categories">
        <Link to="/events" className="font-medium text-[var(--cc-primary)] hover:underline">All technology events</Link>
        <Link to="/hackathons" className="font-medium text-[var(--cc-primary)] hover:underline">College hackathons</Link>
        <Link to="/workshops" className="font-medium text-[var(--cc-primary)] hover:underline">Student workshops</Link>
        <Link to="/competitions" className="font-medium text-[var(--cc-primary)] hover:underline">Coding competitions</Link>
      </nav>

      {/* =====================================================
          Events
      ===================================================== */}
      <section className="container-page py-10 md:py-14">

        <p className="text-sm text-[var(--cc-text-muted)]">

          {loading
            ? "Finding events..."
            : `${visibleEvents.length} event${
                visibleEvents.length === 1
                  ? ""
                  : "s"
              } found`}

        </p>


        {loading ? (
          <EventGridSkeleton />

        ) : visibleEvents.length ? (

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {visibleEvents.map((event) => (
              <EventCard
                key={
                  event._id ||
                  event.slug
                }
                event={event}
              />
            ))}

          </div>

        ) : (

          <div className="mt-6">

            <EmptyState
              title="No matching events"
              description="Try a different keyword or event category."
            />

          </div>

        )}

      </section>

    </PublicLayout>
  );
}


/*
 * ---------------------------------------------------------
 * Loading skeleton
 * ---------------------------------------------------------
 */
function EventGridSkeleton() {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

      {[1, 2, 3, 4, 5, 6].map(
        (item) => (
          <div
            key={item}
            className="h-80 animate-pulse rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]"
          />
        )
      )}

    </div>
  );
}
