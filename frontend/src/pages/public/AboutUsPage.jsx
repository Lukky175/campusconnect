import { ArrowDown, ArrowRight, BookOpen, HeartHandshake, Network } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/common/Button";
import Seo from "../../components/common/Seo";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const values = [
  { icon: Network, title: "Find what’s happening", text: "Events, clubs and campus updates are easier to find when they live in one place." },
  { icon: BookOpen, title: "Learn from each other", text: "Share useful ideas and experiences, and pick up something from another student." },
  { icon: HeartHandshake, title: "Make campus feel closer", text: "A small connection can make a new opportunity or a big university feel more approachable." },
];

export default function AboutUsPage() {
  return <PublicLayout mainClassName="pt-0">
    <Seo
      title="About CampusConnect and our student team"
      description="Meet the Bennett University students building CampusConnect to help students find campus events, technology clubs and opportunities."
      path="/about"
    />
    <Breadcrumbs items={[{ label: "Home", to: "/" }]} current="About" />
    <main>
      <section className="relative isolate flex min-h-[68svh] items-end overflow-hidden bg-[#201710] pt-28 sm:pt-36">
        <img src="/bennet-university.jpg" alt="Bennett University campus" className="absolute inset-0 -z-20 size-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
        <div className="container-page grid min-h-[58svh] items-end gap-8 pb-12 pt-8 md:grid-cols-[1fr_auto] md:items-center md:pb-16 sm:pt-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">Made by Bennett students</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl">We built the campus space we wanted to find.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">We’re four fourth-year students at Bennett University. CampusConnect brings campus events, technical communities and student conversations into one place, so it’s easier to find your people and take part.</p>
            <Button href="#our-story" variant="secondary" className="mt-7 rounded-full border-white/30 bg-white !text-[#2b211a] hover:bg-white/90">Our story <ArrowDown className="size-4" /></Button>
          </div>
          <div className="hidden rounded-2xl border border-white/25 bg-black/20 p-5 text-white shadow-2xl backdrop-blur-md md:block"><p className="text-4xl font-semibold">4</p><p className="mt-1 max-w-40 text-sm leading-5 text-white/75">final-year students building for their campus</p></div>
        </div>
      </section>

      <section id="our-story" className="container-page scroll-mt-8 py-16 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div><p className="text-sm font-semibold text-[var(--cc-primary)]">Why we started</p><h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-[var(--cc-heading)] sm:text-4xl">Campus has a lot going on. Finding it shouldn’t be hard.</h2></div>
          <div className="space-y-4 text-sm leading-7 text-[var(--cc-text-muted)] sm:text-base"><p>University life is full of worthwhile events, clubs, ideas and people. But details can be spread across different groups and channels, and it’s easy to miss something that would have helped you learn or feel included.</p><p>We made CampusConnect as a practical home for those things: browse what’s happening, explore student communities, read campus stories and share questions or useful updates in the feed.</p><p>This is a student project for Bennett University. We’re building it around the everyday ways students discover opportunities and help each other make the most of campus.</p></div>
        </div>
        <figure className="mt-10 overflow-hidden rounded-2xl border border-[var(--cc-border)]"><img src="/bennet-university.jpg" alt="Bennett University buildings and campus" loading="lazy" className="max-h-[34rem] w-full object-cover" /><figcaption className="border-t border-[var(--cc-border)] bg-[var(--cc-surface)] px-4 py-3 text-xs text-[var(--cc-text-muted)]">Bennett University · Greater Noida</figcaption></figure>
      </section>

      <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]"><div className="container-page py-16 md:py-20"><p className="text-sm font-semibold text-[var(--cc-primary)]">What CampusConnect is for</p><h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">A useful place to discover, share and show up.</h2><div className="mt-9 grid gap-4 md:grid-cols-3">{values.map(({ icon: Icon, title, text }, index) => <article key={title} className="rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6"><div className="flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-5" /></span><span className="text-xs font-medium tracking-widest text-[var(--cc-text-soft)]">0{index + 1}</span></div><h3 className="mt-6 text-lg font-semibold text-[var(--cc-heading)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--cc-text-muted)]">{text}</p></article>)}</div></div></section>

      <section className="container-page py-16 md:py-20"><div className="flex flex-col gap-6 rounded-2xl bg-[var(--cc-primary)] p-6 text-white sm:p-9 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><p className="text-sm font-medium text-white/75">Your campus, connected</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Find something worth being part of.</h2><p className="mt-3 text-sm leading-6 text-white/80">Explore student communities and see what’s coming up at Bennett.</p></div><div className="flex flex-wrap gap-3"><Button to="/events" variant="secondary" className="rounded-full">Explore events <ArrowRight className="size-4" /></Button><Button to="/clubs" variant="secondary" className="rounded-full">Browse tech clubs</Button></div></div></section>
    </main>
  </PublicLayout>;
}
