import { Fragment, useEffect, useState } from "react";
import { Code2, ExternalLink, UsersRound } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function ClubsPage({ dashboard = false }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const showDetails = dashboard || isAuthenticated;
  const PageLayout = dashboard ? Fragment : PublicLayout;
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let active = true;

    async function loadClubs() {
      setLoading(true);
      setError("");

      try {
        const response = showDetails
          ? await api.getClubDetails()
          : await api.getClubs();

        if (active) {
          setClubs(response?.clubs || []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load clubs right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      active = false;
    };
  }, [authLoading, showDetails, reloadKey]);

  return (
    <PageLayout>
      <section className="border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
        <div className={dashboard ? "" : "container-page"}>
          <div className="py-10 md:py-14">
            <p className="text-sm font-medium text-[var(--cc-primary)]">
              Bennett University · Student communities
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">
                  Tech clubs
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)] sm:text-base">
                  Explore the computing chapters and student communities at Bennett University, from competitive programming to developer technologies.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-sm text-[var(--cc-text-muted)]">
                <UsersRound className="size-4 text-[var(--cc-primary)]" />
                {loading ? "Loading clubs…" : `${clubs.length} communities`}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={dashboard ? "py-8 md:py-10" : "container-page py-8 md:py-12"}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]"
                aria-hidden="true"
              />
            ))
          ) : error ? (
            <div className="col-span-full rounded-[var(--cc-radius-lg)] border border-[var(--cc-danger)]/30 bg-[var(--cc-danger-soft)] p-6">
              <h2 className="font-semibold text-[var(--cc-heading)]">Clubs couldn’t be loaded</h2>
              <p className="mt-2 text-sm text-[var(--cc-text-muted)]">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-4 text-sm font-medium text-[var(--cc-primary)] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : clubs.length ? clubs.map((club) => (
            <article
              key={club.slug}
              className="flex h-full flex-col rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] transition-shadow hover:shadow-[var(--cc-shadow-md)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--cc-radius-md)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
                  <Code2 className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-full bg-[var(--cc-surface-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--cc-text-muted)]">
                  {club.short_name}
                </span>
              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-[var(--cc-primary)]">
                {club.category}
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--cc-heading)]">
                {club.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
                {showDetails ? club.description : club.summary}
              </p>

              {showDetails && club.focus_areas?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {club.focus_areas.map((focus) => (
                    <span
                      key={focus}
                      className="rounded-full bg-[var(--cc-surface-subtle)] px-2.5 py-1 text-xs text-[var(--cc-text-muted)]"
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              )}

              {showDetails && club.links?.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--cc-border)] pt-4">
                  {club.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[var(--cc-primary)] hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          )) : (
            <div className="col-span-full rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-14 text-center">
              <h2 className="font-semibold text-[var(--cc-heading)]">No clubs available yet</h2>
              <p className="mt-2 text-sm text-[var(--cc-text-muted)]">Club information will appear here when it is published.</p>
            </div>
          )}
        </div>
        {!showDetails && (
          <div className="mt-6 flex flex-col gap-2 text-xs leading-5 text-[var(--cc-text-soft)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Club descriptions are brief summaries. Sign in to view more information and available community links.
            </p>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
