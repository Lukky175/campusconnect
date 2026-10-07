import {
  ArrowRight,
  Search,
  UserRound,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your profile",
    text: "Tell CampusConnect a little about yourself, your university and what you are interested in.",
  },
  {
    number: "02",
    icon: Search,
    title: "Explore",
    text: "Browse opportunities, communities and resources without jumping between different platforms.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Take part",
    text: "Save what matters, register for opportunities and gradually build your campus journey.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">

      <div className="container-page py-20 lg:py-24">

        <div className="max-w-2xl">

          <p className="text-sm font-medium text-[var(--cc-primary)]">
            How it works
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">
            Simple by design.
          </h2>

          <p className="mt-4 text-sm leading-6 text-[var(--cc-text-muted)]">
            CampusConnect is built to make discovery feel straightforward,
            rather than adding another complicated student platform to your day.
          </p>

        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">

          {steps.map(
            ({ number, icon: Icon, title, text }, index) => (
              <article
                key={number}
                className="relative"
              >

                <div className="flex items-center justify-between">

                  <span className="text-xs font-medium tracking-wider text-[var(--cc-text-soft)]">
                    {number}
                  </span>

                  <Icon className="size-5 text-[var(--cc-primary)]" />

                </div>

                <h3 className="mt-6 text-lg font-semibold text-[var(--cc-heading)]">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
                  {text}
                </p>

                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-4 -translate-y-1/2 text-[var(--cc-border-strong)] md:block" />
                )}

              </article>
            )
          )}

        </div>

      </div>

    </section>
  );
}