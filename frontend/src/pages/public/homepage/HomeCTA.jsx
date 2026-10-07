import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeCTA() {
  return (
    <section className="container-page pb-20 lg:pb-24">

      <div className="overflow-hidden rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-primary)] px-6 py-12 text-[var(--cc-on-primary)] sm:px-10 lg:px-14">

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          <div className="max-w-xl">

            <p className="text-sm font-medium opacity-75">
              Get started
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Make your next campus opportunity easier to find.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 opacity-80">
              Create your student profile and start exploring what CampusConnect
              has to offer.
            </p>

          </div>

          <Link
            to="/register"
            className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--cc-radius-sm)] bg-[var(--cc-surface)] px-5 py-3 text-sm font-medium text-[var(--cc-heading)] transition-colors hover:bg-[var(--cc-surface-subtle)]"
          >
            Create account
            <ArrowRight className="size-4" />
          </Link>

        </div>

      </div>

    </section>
  );
}