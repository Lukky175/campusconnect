import { ArrowRight, BookOpenText, CalendarDays, Code2, MessagesSquare, MoveUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../../components/layout/PublicLayout";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/common/Button";

const discoveryLinks = [
  {
    icon: CalendarDays,
    label: "Find your next event",
    detail: "Hackathons, workshops, talks, and campus activities.",
    href: "/events",
    action: "Explore events",
  },
  {
    icon: Code2,
    label: "Meet student communities",
    detail: "Get to know the clubs building things at Bennett.",
    href: "/clubs",
    action: "Browse tech clubs",
  },
  {
    icon: BookOpenText,
    label: "Learn from campus stories",
    detail: "Read practical guides and ideas from the community.",
    href: "/blog",
    action: "Read the journal",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const feedHref = isAuthenticated ? "/dashboard/feed" : "/login";

  return <PublicLayout>
    <section className="overflow-hidden border-b border-[var(--cc-border)] bg-[var(--cc-bg)]">
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:min-h-[620px] lg:grid-cols-[1fr_0.92fr] lg:gap-14 lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-1.5 text-xs font-medium text-[var(--cc-text-muted)]">
            <span className="size-1.5 rounded-full bg-[var(--cc-accent)]" />
            Made for Bennett University
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--cc-heading)] sm:text-5xl lg:text-[3.7rem]">
            Campus life works better <span className="text-[var(--cc-primary)]">when we connect.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--cc-text-muted)] sm:text-lg sm:leading-8">
            Find what’s happening, discover the communities around you, and share what you’re learning—all in one place for Bennett students.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/events" className="min-h-11 rounded-[var(--cc-radius-sm)] px-5 font-semibold">Explore campus <ArrowRight className="size-4" /></Button>
            <Button to={feedHref} variant="secondary" className="min-h-11 rounded-[var(--cc-radius-sm)] px-5 font-semibold"><MessagesSquare className="size-4" /> {isAuthenticated ? "Open the feed" : "Join the conversation"}</Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[var(--cc-text-soft)]"><span>Student-built</span><span>For the Bennett community</span><span>Opportunities, people, ideas</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px] lg:mr-0">
          <div className="absolute -right-6 -top-6 size-36 rounded-full bg-[var(--cc-accent-soft)] blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-2 shadow-[var(--cc-shadow-md)]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.1rem] sm:min-h-[430px]">
              <img src="/Bennett_2.webp" alt="Bennett University campus building" fetchPriority="high" className="absolute inset-0 size-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#211812]/80 via-[#211812]/10 to-[#211812]/5" />
              <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:left-7 sm:top-7">Your campus, brought together</div>
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/20 bg-white/90 p-4 shadow-lg backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-primary)]">CampusConnect</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div><h2 className="text-lg font-semibold tracking-tight text-[#2c211b] sm:text-xl">More of campus, in one place.</h2><p className="mt-1 text-sm leading-5 text-[#75675d]">Discover. Participate. Grow.</p></div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--cc-primary)] text-[var(--cc-on-primary)]"><MoveUpRight className="size-4" /></span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] px-4 py-3 shadow-[var(--cc-shadow-md)] sm:block lg:-left-7"><p className="text-xs text-[var(--cc-text-soft)]">Built by students</p><p className="mt-0.5 text-sm font-semibold text-[var(--cc-heading)]">For student life at Bennett</p></div>
        </div>
      </div>
    </section>

    <section className="container-page py-16 sm:py-20 lg:py-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-[var(--cc-primary)]">A little more connected</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">Start with what matters to you.</h2></div>
        <p className="max-w-md text-sm leading-6 text-[var(--cc-text-muted)]">CampusConnect brings useful campus information together, so it’s easier to find your next step.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {discoveryLinks.map(({ icon: Icon, label, detail, href, action }) => <Link key={href} to={href} className="group rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-md)] sm:p-6">
          <span className="flex size-10 items-center justify-center rounded-[var(--cc-radius-sm)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-5" /></span>
          <h3 className="mt-5 text-base font-semibold text-[var(--cc-heading)]">{label}</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--cc-text-muted)]">{detail}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cc-primary)]">{action}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>)}
      </div>
    </section>

    <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
      <div className="container-page grid gap-8 py-12 sm:py-16 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="text-sm font-semibold text-[var(--cc-primary)]">A community, not another notice board</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">Bring your questions, ideas, and campus updates to the conversation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">The Campus Feed gives signed-in students a shared place to post, react, and help one another out.</p></div>
        <Button to={feedHref} variant="secondary" className="min-h-11 rounded-[var(--cc-radius-sm)] px-5 font-semibold">{isAuthenticated ? "Go to campus feed" : "Sign in to join"}<ArrowRight className="size-4" /></Button>
      </div>
    </section>

    <section className="container-page py-14 sm:py-18">
      <div className="flex flex-col gap-5 rounded-[var(--cc-radius-xl)] bg-[var(--cc-primary)] px-6 py-9 text-[var(--cc-on-primary)] sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-10">
        <div><p className="text-sm font-medium text-white/75">Your campus is already full of possibility.</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Let’s make it easier to find.</h2></div>
        <Button to={isAuthenticated ? "/dashboard" : "/register"} variant="secondary" className="min-h-11 shrink-0 rounded-[var(--cc-radius-sm)] px-5 font-semibold">{isAuthenticated ? "Open your dashboard" : "Create your account"}<ArrowRight className="size-4" /></Button>
      </div>
    </section>
  </PublicLayout>;
}
