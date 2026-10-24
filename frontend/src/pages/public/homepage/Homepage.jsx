import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpenText, CalendarDays, Code2, MessagesSquare, MoveDown, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../../components/layout/PublicLayout";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../services/api";

const campusPaths = [
  { icon: CalendarDays, number: "01", title: "Find your next thing", text: "Hackathons, talks, workshops and campus activities, collected in one place.", link: "Browse events", to: "/events" },
  { icon: Code2, number: "02", title: "Meet the builders", text: "Explore Bennett’s technology clubs and the communities behind them.", link: "Explore clubs", to: "/clubs" },
  { icon: BookOpenText, number: "03", title: "Learn from each other", text: "Read student stories and practical notes from life around campus.", link: "Read the blog", to: "/blog" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const feedHref = isAuthenticated ? "/dashboard/feed" : "/login";
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.getEvents(), api.getClubs()]).then(([eventResult, clubResult]) => {
      if (!active) return;
      if (eventResult.status === "fulfilled") setEvents((eventResult.value.events || []).slice(0, 3));
      if (clubResult.status === "fulfilled") setClubs((clubResult.value.clubs || []).slice(0, 4));
    });
    return () => { active = false; };
  }, []);

  return <PublicLayout mainClassName="pt-0">
    <CampusVideoHero communityHref={feedHref} />

    <section className="container-page py-16 sm:py-20 lg:py-24">
      <div className="grid items-center gap-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-14">
        <div><p className="text-sm font-semibold text-[var(--cc-primary)]">A student-built campus home</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[var(--cc-heading)] sm:text-4xl">We made this because campus life is better when we find each other.</h2><p className="mt-4 text-sm leading-7 text-[var(--cc-text-muted)] sm:text-base">We’re four final-year students at Bennett University. CampusConnect brings the events, clubs, ideas and people that make this place feel like a community into one useful home.</p><Link to="/about" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cc-primary)] hover:underline">More about us <ArrowRight className="size-4" /></Link></div>
        <figure className="relative"><img src="/Bennett_2.webp" alt="Bennett University campus, where CampusConnect was built" loading="lazy" className="aspect-[1.55] w-full rounded-[1.5rem] object-cover shadow-[var(--cc-shadow-md)]" /><figcaption className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/45 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm">Bennett University · Greater Noida</figcaption></figure>
      </div>
    </section>

    <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
      <div className="container-page py-14 sm:py-18 lg:py-20"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[var(--cc-primary)]">What you can do here</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">Less searching. More taking part.</h2></div><p className="max-w-md text-sm leading-6 text-[var(--cc-text-muted)]">Start with what you came for. Stay for what you find along the way.</p></div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">{campusPaths.map(({ icon: Icon, number, title, text, link, to }) => <Link key={to} to={to} className="group flex min-h-64 flex-col rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 transition hover:-translate-y-1 hover:shadow-[var(--cc-shadow-md)] sm:p-6"><div className="flex items-center justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-5" /></span><span className="text-xs font-semibold tracking-wide text-[var(--cc-text-soft)]">{number}</span></div><h3 className="mt-6 text-lg font-semibold text-[var(--cc-heading)]">{title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[var(--cc-text-muted)]">{text}</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cc-primary)]">{link}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></Link>)}</div>
      </div>
    </section>

    <section className="container-page py-16 sm:py-20 lg:py-24">
      <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start lg:gap-14">
        <div className="lg:sticky lg:top-28"><p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cc-primary)]"><Sparkles className="size-4" /> Around Bennett</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">The campus is always making something happen.</h2><p className="mt-4 max-w-md text-sm leading-7 text-[var(--cc-text-muted)]">A workshop you didn’t know about. A club building its next project. A question someone can help answer. CampusConnect brings those moments closer together.</p><Link to="/events" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cc-primary)] hover:underline">See all campus events <ArrowRight className="size-4" /></Link></div>
        <div className="space-y-3">
          {events.length > 0 ? events.map((event, index) => <Link key={event._id || event.slug || index} to={`/events/${event.slug || event._id}`} className="group grid gap-4 rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--cc-shadow-md)] sm:grid-cols-[4.5rem_1fr_auto] sm:items-center sm:p-5"><span className="flex size-14 flex-col items-center justify-center rounded-xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><CalendarDays className="size-4" /><span className="mt-1 text-[10px] font-semibold">{formatEventDate(event.date || event.start_date)}</span></span><span className="min-w-0"><span className="block truncate font-semibold text-[var(--cc-heading)]">{event.title}</span><span className="mt-1 block line-clamp-2 text-sm leading-5 text-[var(--cc-text-muted)]">{event.description || event.location || "Discover an upcoming Bennett University event."}</span></span><ArrowUpRight className="hidden size-5 text-[var(--cc-text-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cc-primary)] sm:block" /></Link>) : <div className="rounded-2xl border border-dashed border-[var(--cc-border-strong)] p-6 text-sm text-[var(--cc-text-muted)]">Campus events will appear here as they’re published. <Link to="/events" className="font-semibold text-[var(--cc-primary)]">Browse events</Link></div>}
          <Link to="/clubs" className="group flex items-center justify-between gap-4 rounded-2xl bg-[var(--cc-primary)] p-5 text-white sm:p-6"><span><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80"><Code2 className="size-4" /> Student communities</span><span className="mt-2 block text-lg font-semibold text-white">Find your corner of campus</span><span className="mt-1 block text-sm text-white/85">{clubs.length ? `${clubs.map((club) => club.short_name || club.name).join(" · ")}${clubs.length === 4 ? " · …" : ""}` : "Explore Bennett’s clubs, interests, and people."}</span></span><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition group-hover:bg-white/10"><ArrowRight className="size-4" /></span></Link>
        </div>
      </div>
    </section>

    <section className="border-y border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
      <div className="container-page grid gap-8 py-14 sm:py-18 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20"><div><p className="text-sm font-semibold text-[var(--cc-primary)]">Made here, for here</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">A student project for the parts of university that happen between classes.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--cc-text-muted)]">We’re four final-year Bennett students building a shared place to discover events, find technical communities, swap ideas, and help each other make the most of campus.</p></div><div className="flex flex-wrap gap-3"><Button to="/about" variant="secondary" className="rounded-full px-5">Our story <ArrowRight className="size-4" /></Button><Button to={feedHref} className="rounded-full px-5">{isAuthenticated ? "Open Campus Feed" : "Meet the community"}<MessagesSquare className="size-4" /></Button></div></div>
    </section>

    <section className="container-page py-14 sm:py-18"><div className="grid overflow-hidden rounded-[1.5rem] bg-[var(--cc-primary)] text-[var(--cc-on-primary)] md:grid-cols-[1fr_auto] md:items-center"><div className="p-6 sm:p-9 lg:p-11"><p className="text-sm font-semibold opacity-75">The conversation is already happening</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">Bring a question, share a win, help someone else along.</h2><p className="mt-3 max-w-xl text-sm leading-6 opacity-80">Campus Feed is a student space for updates, questions, and practical help that makes a big university feel smaller.</p></div><div className="px-6 pb-6 md:px-9 md:pb-0"><Button to={feedHref} variant="secondary" className="min-h-11 rounded-full px-5 font-semibold">{isAuthenticated ? "Go to Campus Feed" : "Meet the community"}<ArrowRight className="size-4" /></Button></div></div></section>
  </PublicLayout>;
}

function CampusVideoHero({ communityHref }) {
  const stageRef = useRef(null);
  const panelRef = useRef(null);
  const videoRef = useRef(null);
  const copyRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const panel = panelRef.current;
    const video = videoRef.current;
    if (!stage || !panel || !video) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let targetProgress = 0;
    let displayedProgress = 0;
    let lastSeekAt = 0;
    let seeking = false;
    let lastFrame = -1;
    let previousFrameAt = performance.now();
    let lastScrollAt = 0;
    let desiredFrame = 0;
    let disposed = false;
    const setTargetFromScroll = () => {
      lastScrollAt = performance.now();
      const distance = Math.max(1, stage.offsetHeight - window.innerHeight);
      targetProgress = Math.max(0, Math.min(1, -stage.getBoundingClientRect().top / distance));
      requestFrame();
    };
    const update = () => {
      frame = 0;
      const now = performance.now();
      const deltaSeconds = Math.min(0.05, Math.max(0.001, (now - previousFrameAt) / 1000));
      previousFrameAt = now;
      const difference = targetProgress - displayedProgress;
      const smoothingMs = Math.abs(difference) > 0.12 ? 112 : 145;
      const blend = reduceMotion ? 1 : 1 - Math.exp(-(deltaSeconds * 1000) / smoothingMs);
      displayedProgress += difference * blend;
      if (Math.abs(targetProgress - displayedProgress) < 0.001) displayedProgress = targetProgress;
      const progress = displayedProgress;
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(video.duration) && video.duration > 0 && !reduceMotion) {
        // The clip is 30 fps. Snap to its frame grid, and keep only the newest
        // requested frame while the browser decodes the current seek.
        const finalFrame = Math.max(0, Math.floor(Math.max(0, video.duration - 1 / 30) * 30));
        desiredFrame = Math.max(0, Math.min(finalFrame, Math.round(progress * finalFrame)));
        // Keep random-access video decodes below source frame rate while input
        // is active. This avoids decoder backlogs on quick touch/wheel scrolls.
        const seekInterval = now - lastScrollAt < 120 ? 1000 / 22 : 1000 / 30;
        if (!seeking && desiredFrame !== lastFrame && now - lastSeekAt >= seekInterval) {
          lastFrame = desiredFrame;
          if (Math.abs(video.currentTime - desiredFrame / 30) > 1 / 60) {
            seeking = true;
            video.currentTime = desiredFrame / 30;
            lastSeekAt = now;
          }
        }
      }
      panel.style.transform = `perspective(1400px) rotateX(${progress * 3.2}deg) scale(${1 - progress * 0.085}) translateY(${progress * 12}px)`;
      panel.style.borderRadius = `${progress * 28}px`;
      if (copyRef.current) copyRef.current.style.transform = `translateY(${progress * -18}px)`;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      if (Math.abs(targetProgress - displayedProgress) >= 0.001) requestFrame();
    };
    const requestFrame = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const handleSeeked = () => {
      seeking = false;
      if (disposed) return;
      // This next animation frame sees the newest scroll target, rather than
      // scheduling every intermediate seek generated during a fast wheel flick.
      requestFrame();
    };
    window.addEventListener("scroll", setTargetFromScroll, { passive: true });
    window.addEventListener("resize", setTargetFromScroll);
    video.addEventListener("loadedmetadata", requestFrame);
    video.addEventListener("seeked", handleSeeked);
    setTargetFromScroll();
    return () => {
      disposed = true;
      window.removeEventListener("scroll", setTargetFromScroll);
      window.removeEventListener("resize", setTargetFromScroll);
      video.removeEventListener("loadedmetadata", requestFrame);
      video.removeEventListener("seeked", handleSeeked);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={stageRef} className="relative h-[500svh] bg-[#221810]" aria-label="CampusConnect at Bennett University">
    <div className="sticky top-0 h-[100svh] overflow-hidden">
      <div ref={panelRef} className="absolute inset-0 overflow-hidden will-change-transform [backface-visibility:hidden]">
        <video ref={videoRef} muted playsInline preload="auto" poster="/Bennett_2.webp" aria-label="Campus video scrubbed as you scroll" className="absolute inset-0 size-full object-cover"><source src="/BU_Scroll.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-white/20"><div ref={progressRef} className="h-full origin-left scale-x-0 bg-white/90" /></div>
        <div ref={copyRef} className="container-page relative flex h-full flex-col justify-center pt-16 text-white will-change-transform">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-sm">Bennett University · Greater Noida</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">Campus life,<br />a little closer.</h1>
          <div className="mt-7 flex flex-wrap gap-3"><Button to="/events" variant="secondary" className="min-h-12 rounded-full border-white/30 bg-white px-5 font-semibold !text-[#2b211a] hover:bg-white/90">See what’s happening <ArrowRight className="size-4" /></Button><Link to={communityHref} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/50 bg-black/15 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"><MessagesSquare className="size-4" /> Meet the community</Link></div>
          <div className="absolute bottom-8 left-0 inline-flex items-center gap-2 text-xs font-medium text-white/75"><MoveDown className="size-4" /> Scroll to explore CampusConnect</div>
          <div className="absolute bottom-8 right-0 hidden items-center gap-2 text-xs font-medium tracking-[0.12em] text-white/65 sm:flex"><UsersRound className="size-4" /> BUILT BY BENNETT STUDENTS</div>
        </div>
      </div>
    </div>
  </section>;
}

function formatEventDate(value) {
  if (!value) return "SOON";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "SOON";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}
