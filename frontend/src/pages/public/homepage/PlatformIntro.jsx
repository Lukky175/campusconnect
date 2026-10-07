import {
  BookOpen,
  CalendarDays,
  UsersRound,
} from "lucide-react";

const pillars = [
  {
    icon: CalendarDays,
    title: "Discover",
    description:
      "Find opportunities relevant to student life, from technology events to competitions and workshops.",
  },
  {
    icon: UsersRound,
    title: "Connect",
    description:
      "Discover clubs, communities and people around the interests you want to explore further.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description:
      "Use practical guides and resources to prepare better and make more of the opportunities you find.",
  },
];

export default function PlatformIntro() {
  return (
    <section className="container-page py-20 lg:py-24">

      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">

        <div>
          <p className="text-sm font-medium text-[var(--cc-primary)]">
            What is CampusConnect?
          </p>

          <h2 className="mt-2 max-w-md text-3xl font-semibold leading-tight tracking-tight text-[var(--cc-heading)]">
            A simpler way to navigate university life.
          </h2>
        </div>

        <div className="max-w-2xl">

          <p className="text-base leading-7 text-[var(--cc-text-muted)]">
            University has no shortage of opportunities. The difficult part is
            finding the right ones at the right time. CampusConnect is designed
            as a central student platform where useful opportunities and
            communities can be discovered without searching across disconnected
            channels.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">

            {pillars.map(
              ({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="border-t border-[var(--cc-border)] pt-5"
                >
                  <Icon className="size-5 text-[var(--cc-primary)]" />

                  <h3 className="mt-4 text-sm font-semibold text-[var(--cc-heading)]">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
                    {description}
                  </p>
                </article>
              )
            )}

          </div>

        </div>

      </div>

    </section>
  );
}