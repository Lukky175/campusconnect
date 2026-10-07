import {
  GraduationCap,
  LaptopMinimal,
  Network,
} from "lucide-react";

const groups = [
  {
    icon: GraduationCap,
    title: "Students",
    text: "Discover opportunities, develop interests and keep your university journey organized.",
  },
  {
    icon: LaptopMinimal,
    title: "Student communities",
    text: "Make clubs and communities easier for students to discover and engage with.",
  },
  {
    icon: Network,
    title: "Campus ecosystem",
    text: "Create a connected space for opportunities, knowledge and participation across campus.",
  },
];

export default function Audience() {
  return (
    <section className="container-page py-20 lg:py-24">

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

        <div className="max-w-xl">

          <p className="text-sm font-medium text-[var(--cc-primary)]">
            Built for campus life
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">
            One platform, different ways to participate.
          </h2>

        </div>

        <p className="max-w-sm text-sm leading-6 text-[var(--cc-text-muted)]">
          Start with what you need today. CampusConnect can grow with you as
          your interests and university experience change.
        </p>

      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">

        {groups.map(
          ({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6 transition-transform hover:-translate-y-0.5"
            >

              <div className="flex size-10 items-center justify-center rounded-[var(--cc-radius-sm)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]">
                <Icon className="size-5" />
              </div>

              <h3 className="mt-6 font-semibold text-[var(--cc-heading)]">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">
                {text}
              </p>

            </article>
          )
        )}

      </div>

    </section>
  );
}