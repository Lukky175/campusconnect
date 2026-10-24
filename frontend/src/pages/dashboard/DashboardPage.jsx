import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, ClipboardCheck, Code2, FileText, Flag, Globe2, LayoutDashboard, MessagesSquare, Settings, ShieldCheck, Sparkles, UserRound, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const eventOf = (registration) => registration?.event || registration?.event_details || {};
const statusOf = (registration) => String(registration?.status || "registered").toLowerCase();
const activeRegistration = (registration) => !["cancelled", "rejected"].includes(statusOf(registration));

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [clubCount, setClubCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const canViewRegistrations = hasPermission("registrations.view_own") || hasPermission("registrations.view");
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    let active = true;
    const requests = [api.getClubs().then((data) => { if (active) setClubCount(data.clubs?.length ?? 0); }).catch(() => { if (active) setClubCount(null); })];
    if (canViewRegistrations) requests.push(api.getMyRegistrations().then((data) => { if (active) setRegistrations(data.registrations || []); }).catch((error) => { if (active) setLoadError(error.message || "Your registrations could not be loaded."); }));
    Promise.all(requests).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canViewRegistrations]);

  const upcoming = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return registrations.filter(activeRegistration).map((registration) => ({ registration, event: eventOf(registration) })).filter(({ event }) => {
      const date = parseDate(event.start_date || event.date);
      return !date || date >= today;
    }).sort((a, b) => (parseDate(a.event.start_date || a.event.date)?.getTime() ?? Infinity) - (parseDate(b.event.start_date || b.event.date)?.getTime() ?? Infinity));
  }, [registrations]);
  const activeCount = registrations.filter(activeRegistration).length;
  const next = upcoming[0];
  const workspaceLinks = [
    { title: "Events", detail: "Find workshops, hackathons and campus activities.", to: "/dashboard/events", icon: CalendarDays },
    { title: "Campus Feed", detail: "Ask, share, react and learn with students.", to: "/dashboard/feed", icon: MessagesSquare },
    { title: "Tech Clubs", detail: "Explore student technology communities.", to: "/dashboard/clubs", icon: Code2 },
    ...(canViewRegistrations ? [{ title: "My Registrations", detail: "See the events you signed up for.", to: "/dashboard/registrations", icon: ClipboardCheck }] : []),
    { title: "Profile", detail: "View the details and links on your profile.", to: "/dashboard/profile", icon: UserRound },
    { title: "Settings", detail: "Update profile links and preferences.", to: "/dashboard/settings", icon: Settings },
  ];
  const adminLinks = [
    ...(hasPermission("events.view") && (hasPermission("events.create") || hasPermission("events.edit") || hasPermission("events.edit_own")) ? [{ title: "Manage events", to: "/dashboard/admin/events", icon: CalendarDays }] : []),
    ...(hasPermission("users.view") ? [{ title: "Users", to: "/dashboard/admin/users", icon: UsersRound }] : []),
    ...(hasPermission("roles.view") ? [{ title: "Roles & permissions", to: "/dashboard/admin/roles", icon: ShieldCheck }] : []),
    ...(hasPermission("clubs.manage") ? [
      { title: "Tech clubs", to: "/dashboard/admin/clubs", icon: Code2 },
    ] : []),
    ...(hasPermission("blogs.manage") ? [
      { title: "Blogs management", to: "/dashboard/admin/blogs", icon: FileText },
    ] : []),
    ...(hasPermission("website.manage") ? [
      { title: "Website settings", to: "/dashboard/admin/website-settings", icon: Globe2 },
    ] : []),
    ...(hasPermission("feed.moderate") ? [
      { title: "Feed reports", to: "/dashboard/admin/feed-reports", icon: Flag },
    ] : []),
  ];

  return <div className="mx-auto max-w-7xl space-y-7">
    <section className="relative overflow-hidden rounded-[1.5rem] bg-[var(--cc-primary)] px-6 py-7 text-[var(--cc-on-primary)] shadow-[var(--cc-shadow-md)] sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute -right-12 -top-28 size-80 rounded-full border border-current/10" /><div className="pointer-events-none absolute -right-2 -top-16 size-60 rounded-full border border-current/10" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-75"><LayoutDashboard className="size-4" /> CampusConnect workspace</div><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Good to see you, {firstName}.</h1><p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">Your Bennett campus, collected in one place. Pick up an event, check in with your community, or share what you’re working on.</p></div>
        <Button to="/dashboard/feed" variant="secondary" className="relative min-h-11 shrink-0 rounded-xl border-transparent px-5 font-semibold"><Sparkles className="size-4" /> Share an update</Button>
      </div>
    </section>

    <section aria-label="Your campus at a glance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard icon={ClipboardCheck} label="My registrations" value={canViewRegistrations ? (loading ? "—" : activeCount) : "—"} note={canViewRegistrations ? "Events you’re currently signed up for" : "Registration access is not enabled"} to={canViewRegistrations ? "/dashboard/registrations" : undefined} />
      <MetricCard icon={CalendarDays} label="Coming up" value={canViewRegistrations ? (loading ? "—" : upcoming.length) : "—"} note={next ? `Next: ${next.event.title || "Registered event"}` : "Your next registered event will appear here"} to={canViewRegistrations ? "/dashboard/registrations" : undefined} />
      <MetricCard icon={Code2} label="Tech clubs" value={loading || clubCount === null ? "—" : clubCount} note="Bennett technology communities to explore" to="/dashboard/clubs" />
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <div className="overflow-hidden rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--cc-border)] px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-text-soft)]">Your schedule</p><h2 className="mt-1 text-lg font-semibold text-[var(--cc-heading)]">My registrations</h2></div>{canViewRegistrations && <Link to="/dashboard/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--cc-primary)] hover:underline">View all <ArrowRight className="size-4" /></Link>}</div>
        <div className="p-5 sm:p-6">
          {!canViewRegistrations && user?.role !== "admin" ? <p className="text-sm text-[var(--cc-text-muted)]">Your account does not currently have event registration access.</p> : loadError ? <p role="alert" className="text-sm text-[var(--cc-danger)]">{loadError}</p> : loading ? <div className="h-24 animate-pulse rounded-xl bg-[var(--cc-surface-subtle)]" /> : registrations.length ? <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">{registrations.map((registration, index) => { const event = eventOf(registration) || {}; return <RegisteredEvent key={registration._id || event._id || index} registration={registration} event={event} featured={index === 0} />; })}</div> : <div className="flex flex-col items-start gap-4 rounded-xl bg-[var(--cc-bg)] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-[var(--cc-heading)]">Nothing on your schedule yet</h3><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Find a campus event that sounds like you.</p></div><Button to="/dashboard/events" variant="secondary" className="shrink-0">Browse events <ArrowRight className="size-4" /></Button></div>}
        </div>
      </div>

      <div className="rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-text-soft)]">Get around</p><h2 className="mt-1 text-lg font-semibold text-[var(--cc-heading)]">Your campus shortcuts</h2></div><div className="mt-4 divide-y divide-[var(--cc-border)]">{workspaceLinks.map(({ title, detail, to, icon: Icon }) => <Link key={to} to={to} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[var(--cc-heading)]">{title}</span><span className="mt-0.5 block text-xs leading-5 text-[var(--cc-text-muted)]">{detail}</span></span><ArrowUpRight className="size-4 shrink-0 text-[var(--cc-text-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--cc-primary)]" /></Link>)}</div></div>
    </section>

    {adminLinks.length > 0 && <section className="rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface-subtle)] p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-text-soft)]">Workspace tools</p><h2 className="mt-1 text-lg font-semibold text-[var(--cc-heading)]">Administration</h2></div><span className="text-xs capitalize text-[var(--cc-text-muted)]">Available to {user?.role?.replaceAll("_", " ")}</span></div><div className="mt-4 flex flex-wrap gap-2">{adminLinks.map(({ title, to, icon: Icon }) => <Link key={to} to={to} className="inline-flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--cc-text)] transition hover:border-[var(--cc-border-strong)] hover:text-[var(--cc-primary)]"><Icon className="size-4 text-[var(--cc-primary)]" />{title}<ArrowUpRight className="size-3.5 text-[var(--cc-text-soft)]" /></Link>)}</div></section>}
  </div>;
}

function MetricCard({ icon: Icon, label, value, note, to }) {
  const content = <><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-5" /></span>{to && <ArrowUpRight className="size-4 text-[var(--cc-text-soft)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}</div><p className="mt-4 text-sm font-medium text-[var(--cc-text-muted)]">{label}</p><div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">{value}</span><span className="text-xs text-[var(--cc-text-soft)]">{label === "My registrations" ? "active" : label === "Coming up" ? "ahead" : "listed"}</span></div><p className="mt-2 line-clamp-1 text-xs text-[var(--cc-text-soft)]">{note}</p></>;
  return to ? <Link to={to} className="group rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-md)] sm:p-5">{content}</Link> : <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)] sm:p-5">{content}</div>;
}

function RegisteredEvent({ registration, event, featured }) {
  const date = parseDate(event.start_date || event.date);
  const to = `/dashboard/events/${encodeURIComponent(event._id || event.slug || "")}`;
  const status = statusOf(registration);
  const statusStyle = status === "cancelled" ? "bg-[var(--cc-surface-subtle)] text-[var(--cc-text-muted)]" : status === "rejected" ? "bg-[var(--cc-danger-soft)] text-[var(--cc-danger)]" : "bg-[var(--cc-success-soft)] text-[var(--cc-success)]";
  return <Link to={to} className={`group flex items-center gap-4 rounded-xl border p-3.5 transition hover:border-[var(--cc-border-strong)] ${featured ? "border-[var(--cc-primary)]/30 bg-[var(--cc-primary-soft)]/50" : "border-[var(--cc-border)] bg-[var(--cc-surface)]"}`}>
    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--cc-surface)] text-[var(--cc-primary)]"><span className="text-[10px] font-bold uppercase tracking-wider">{date ? date.toLocaleDateString(undefined, { month: "short" }) : "Soon"}</span><span className="mt-0.5 text-xl font-semibold leading-none">{date ? date.getDate() : "—"}</span></div>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-[var(--cc-heading)]">{event.title || "Registered event"}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle}`}>{status}</span></div><p className="mt-1 text-xs text-[var(--cc-text-muted)]">{date ? date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "Date to be announced"}{event.location ? ` · ${event.location}` : ""}</p></div><ArrowRight className="size-4 shrink-0 text-[var(--cc-text-soft)] transition-transform group-hover:translate-x-0.5" />
  </Link>;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
