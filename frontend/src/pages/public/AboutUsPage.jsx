import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Network } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

const values = [
  {
    icon: Network,
    title: "Bring Bennett closer",
    text: "Make it easier to find what is happening across campus and discover the people and communities behind it.",
  },
  {
    icon: BookOpen,
    title: "Make room to learn",
    text: "Help students find ideas, experiences and practical knowledge that can support the next step in their journey.",
  },
  {
    icon: HeartHandshake,
    title: "Grow by helping each other",
    text: "Create a campus culture where students can share what they know, encourage one another and grow together.",
  },
];

export default function AboutUsPage() {
  return (
    <PublicLayout>
      <main>
        <section className="overflow-hidden border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
          <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:py-20">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-[var(--cc-primary)]">
                Made by Bennett students
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[var(--cc-heading)] sm:text-5xl">
                A campus feels smaller when we connect.
              </h1>
              <p className="mt-5 text-base leading-7 text-[var(--cc-text-muted)]">
                We’re fourth-year students at Bennett University, and we built
                CampusConnect to help students discover one another, find
                opportunities and make more of campus life.
              </p>
              <a
                href="#our-story"
                className="mt-7 inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] transition hover:bg-[var(--cc-primary-hover)]"
              >
                Get to know us
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-[var(--cc-text-soft)]">
                Discover · Share · Grow together
              </p>
            </div>

            <figure className="relative">
              <div className="absolute -inset-3 -rotate-2 rounded-[var(--cc-radius-xl)] bg-[var(--cc-primary-soft)]" />
              <img
                src="/about-campus-community.png"
                alt="Bennett students sharing ideas around a laptop on campus"
                className="relative aspect-[1.35] w-full rounded-[var(--cc-radius-xl)] object-cover shadow-[var(--cc-shadow-md)]"
                fetchPriority="high"
              />
              <figcaption className="absolute -bottom-4 left-4 rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-4 py-3 text-xs text-[var(--cc-text-muted)] shadow-[var(--cc-shadow-sm)] sm:left-8">
                Built around the people who make campus
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="our-story" className="container-page scroll-mt-8 py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[.95fr_1.05fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-[var(--cc-primary)]">Why we started</p>
              <h2 className="mt-2 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-[var(--cc-heading)] sm:text-4xl">
                Good things happen when students find each other.
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--cc-text-muted)] sm:text-base">
                <p>
                  University life is full of ideas, events, clubs and people
                  worth knowing. But information can be scattered, and it’s
                  easy to miss something that could have helped you learn or
                  feel part of the community.
                </p>
                <p>
                  CampusConnect is our student-built effort to bring more of
                  those opportunities into one welcoming place. We want every
                  Bennett student to be able to discover what’s happening,
                  learn from others and contribute their own ideas and
                  experience.
                </p>
                <p>
                  We’re starting with campus events, tech clubs and student
                  guides, and building toward a more connected campus—together
                  with the students who use it.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/about-peer-learning.png"
                alt="Students learning together in a campus study space"
                loading="lazy"
                className="aspect-[1.25] w-full rounded-[var(--cc-radius-xl)] object-cover"
              />
              <div className="absolute -bottom-5 -left-3 hidden max-w-[230px] rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-md)] sm:block">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--cc-primary)]">Our starting point</p>
                <p className="mt-1 text-sm leading-5 text-[var(--cc-text-muted)]">A useful place to find campus opportunities and communities.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
          <div className="container-page py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[var(--cc-primary)]">What we believe</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">
                Campus is better when we build it together.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[var(--cc-text-muted)] sm:text-base">
                CampusConnect is for every student with something to discover,
                learn or share.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {values.map(({ icon: Icon, title, text }, index) => (
                <article
                  key={title}
                  className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-widest text-[var(--cc-text-soft)]">
                      0{index + 1}
                    </span>
                    <Icon className="size-5 text-[var(--cc-primary)]" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-[var(--cc-heading)]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-16 md:py-20">
          <div className="overflow-hidden rounded-[var(--cc-radius-xl)] bg-[var(--cc-primary)] px-6 py-10 text-[var(--cc-on-primary)] sm:px-10 md:flex md:items-center md:justify-between md:gap-8 md:px-12 md:py-12">
            <div className="max-w-2xl">
              <p className="text-sm font-medium opacity-75">Your campus, connected</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Find something that sparks your next idea.
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-80">
                Explore what students and communities at Bennett are creating.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
              <Link to="/events" className="inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-surface)] px-4 py-2.5 text-sm font-medium text-[var(--cc-heading)] hover:bg-[var(--cc-surface-subtle)]">
                Explore events <ArrowRight className="size-4" />
              </Link>
              <Link to="/clubs" className="inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] border border-white/30 px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-white/10">
                Browse tech clubs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
