import { ArrowRight, Compass, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--cc-border)]">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-[var(--cc-primary-soft)] opacity-70 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-[var(--cc-accent-soft)] opacity-60 blur-3xl" />

      <div className="container-page relative grid min-h-[600px] items-center gap-14 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">

        {/* Left content */}
        <div className="max-w-2xl">

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-1.5 text-xs font-medium text-[var(--cc-text-muted)] shadow-[var(--cc-shadow-sm)]">
            <span className="size-1.5 rounded-full bg-[var(--cc-success)]" />
            Built for university students
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--cc-heading)] sm:text-5xl lg:text-6xl">
            Your campus.
            <br />
            <span className="text-[var(--cc-primary)]">
              More connected.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--cc-text-muted)] sm:text-lg">
            CampusConnect brings student opportunities, communities and useful
            resources together so you can spend less time searching and more
            time participating.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              to="/events"
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[var(--cc-radius-sm)] bg-[var(--cc-primary)] px-5 text-sm font-medium text-[var(--cc-on-primary)] transition-colors hover:bg-[var(--cc-primary-hover)]"
            >
              Explore opportunities
              <ArrowRight className="size-4" />
            </Link>

            <Link
              to="/about"
              className="focus-ring inline-flex min-h-11 items-center rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-5 text-sm font-medium text-[var(--cc-text)] transition-colors hover:bg-[var(--cc-surface-subtle)]"
            >
              Learn about CampusConnect
            </Link>

          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[var(--cc-text-soft)]">
            <span>For students</span>

            <span className="hidden size-1 rounded-full bg-[var(--cc-border-strong)] sm:block" />

            <span>Discover opportunities</span>

            <span className="hidden size-1 rounded-full bg-[var(--cc-border-strong)] sm:block" />

            <span>Build your campus network</span>
          </div>

        </div>

        {/* Right visual */}
        <div className="relative">

          <div className="rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-md)]">

            <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface-subtle)] p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--cc-text-soft)]">
                    CampusConnect
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[var(--cc-heading)]">
                    What are you looking for?
                  </h2>
                </div>

                <div className="rounded-md bg-[var(--cc-primary-soft)] p-2.5 text-[var(--cc-primary)]">
                  <Compass className="size-5" />
                </div>

              </div>

              <div className="mt-6 flex items-center gap-2 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-3">
                <Search className="size-4 text-[var(--cc-text-soft)]" />

                <span className="text-sm text-[var(--cc-text-soft)]">
                  Search opportunities...
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">

                {[
                  "Hackathons",
                  "Workshops",
                  "Competitions",
                  "Tech Clubs",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-3 text-sm text-[var(--cc-text)]"
                  >
                    {item}
                  </div>
                ))}

              </div>

              <div className="mt-5 border-t border-[var(--cc-border)] pt-5">

                <div className="flex items-center justify-between text-xs">

                  <span className="text-[var(--cc-text-muted)]">
                    One place for your campus journey
                  </span>

                  <span className="font-medium text-[var(--cc-primary)]">
                    Explore →
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Small floating detail */}
          <div className="absolute -bottom-5 -left-5 hidden rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface-raised)] px-4 py-3 shadow-[var(--cc-shadow-md)] sm:block">

            <p className="text-xs text-[var(--cc-text-soft)]">
              Designed around
            </p>

            <p className="mt-0.5 text-sm font-medium text-[var(--cc-heading)]">
              Student needs
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}