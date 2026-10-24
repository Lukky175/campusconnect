import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ClipboardCheck, Code2, FileText, Flag, Globe2, LayoutDashboard, MessagesSquare, Settings, ShieldCheck, Sparkles, UserRound, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import Button from "../../components/common/Button";

const eventOf = (registration) => registration?.event || registration?.event_details || {};
const statusOf = (registration) => String(registration?.status || "registered").toLowerCase();

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const canViewRegistrations = hasPermission("registrations.view_own");
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    let active = true;
    if (!canViewRegistrations) {
      setRegistrations([]);
      return () => { active = false; };
    }
    setRegistrationsLoading(true);
    api.getMyRegistrations()
      .then((data) => { if (active) setRegistrations(data.registrations || []); })
      .catch((error) => { if (active) setRegistrationError(error.message || "Unable to load your registrations."); })
      .finally(() => { if (active) setRegistrationsLoading(false); });
    return () => { active = false; };
  }, [canViewRegistrations]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return registrations
      .filter((registration) => !["cancelled", "rejected"].includes(statusOf(registration)))
      .map((registration) => ({ registration, event: eventOf(registration) }))
      .filter(({ event }) => {
        const date = parseDate(event.start_date || event.date);
        return !date || date >= today;
      })
      .sort((a, b) => (parseDate(a.event.start_date || a.event.date)?.getTime() ?? Infinity) - (parseDate(b.event.start_date || b.event.date)?.getTime() ?? Infinity));
  }, [registrations]);

  const pages = useMemo(() => {
    const items = [
      { title: "Explore events", text: "Browse campus events and opportunities, then register for the ones that interest you.", to: "/dashboard/events", icon: CalendarDays, action: "Browse events" },
      { title: "Campus Feed", text: "Share questions and updates, react to posts, and join conversations with other students.", to: "/dashboard/feed", icon: MessagesSquare, action: "Open feed" },
      { title: "Tech Clubs", text: "Find information about technology clubs and student communities at Bennett.", to: "/dashboard/clubs", icon: Code2, action: "Explore clubs" },
      ...(canViewRegistrations ? [{ title: "My registrations", text: "Review your event registrations and keep track of upcoming participation.", to: "/dashboard/registrations", icon: ClipboardCheck, action: "View registrations" }] : []),
      { title: "Your profile", text: "Check the account details associated with your CampusConnect profile.", to: "/dashboard/profile", icon: UserRound, action: "Open profile" },
      { title: "Account settings", text: "Manage your personal account preferences and settings.", to: "/dashboard/settings", icon: Settings, action: "Open settings" },
      ...(hasPermission("events.create") ? [{ title: "Manage events", text: "Create and update campus event listings available to students.", to: "/dashboard/admin/events", icon: CalendarDays, action: "Manage events" }] : []),
      ...(hasPermission("users.view") ? [{ title: "Manage users", text: "Review campus accounts and manage user access based on your permissions.", to: "/dashboard/admin/users", icon: UsersRound, action: "Manage users" }] : []),
      ...(hasPermission("roles.manage") ? [{ title: "Roles & permissions", text: "Review access roles and configure the permissions available to each role.", to: "/dashboard/admin/roles", icon: ShieldCheck, action: "Manage access" }] : []),
      ...(user?.role === "admin" ? [
        { title: "Blogs management", text: "Create and manage stories published on the CampusConnect website.", to: "/dashboard/admin/blogs", icon: FileText, action: "Manage blogs" },
        { title: "Website settings", text: "Update public contact information and the questions shown on the FAQ page.", to: "/dashboard/admin/website-settings", icon: Globe2, action: "Manage website" },
        { title: "Feed reports", text: "Review posts that students have reported and take moderation action.", to: "/dashboard/admin/feed-reports", icon: Flag, action: "Review reports" },
      ] : []),
    ];
    return items;
  }, [canViewRegistrations, hasPermission, user?.role]);

  return <div className="mx-auto max-w-7xl space-y-9">
    <section className="relative overflow-hidden rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6 shadow-[var(--cc-shadow-sm)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[var(--cc-primary-soft)] opacity-80 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold capitalize text-[var(--cc-primary)]">{(user?.role || "student").replaceAll("_", " ")} workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">Welcome, {firstName}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">Here’s your CampusConnect workspace. Choose a page below to explore opportunities, stay connected, and take action based on your account access.</p></div>
        <Button to="/dashboard/feed" className="min-h-11 shrink-0 rounded-[var(--cc-radius-sm)] px-5 font-semibold"><Sparkles className="size-4" /> Share an update</Button>
      </div>
    </section>

    <section>
      <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cc-text-soft)]">Your pages</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--cc-heading)]">What you can do</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">These links reflect the pages available to your account.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{pages.map(({ title, text, to, icon: Icon, action }) => <Link key={to} to={to} className="group rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-md)]">
        <span className="flex size-10 items-center justify-center rounded-[var(--cc-radius-sm)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-5" /></span><h3 className="mt-4 font-semibold text-[var(--cc-heading)]">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[var(--cc-text-muted)]">{text}</p><span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--cc-primary)]">{action}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
      </Link>)}</div>
    </section>

    {canViewRegistrations && <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cc-text-soft)]">Your schedule</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--cc-heading)]">Upcoming registered events</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Events you’ve registered for, in date order.</p></div><Link to="/dashboard/registrations" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--cc-primary)] hover:underline">All registrations <ArrowRight className="size-4" /></Link></div>
      {registrationsLoading ? <div className="h-28 animate-pulse rounded-[var(--cc-radius-lg)] bg-[var(--cc-surface)]" />
        : registrationError ? <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-danger)]/30 bg-[var(--cc-danger-soft)] p-4 text-sm text-[var(--cc-text)]">{registrationError}</div>
          : upcoming.length ? <div className="grid gap-3 md:grid-cols-2">{upcoming.slice(0, 4).map(({ registration, event }) => <RegisteredEvent key={registration._id || event._id} registration={registration} event={event} />)}</div>
            : <div className="flex flex-col gap-4 rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-semibold text-[var(--cc-heading)]">No upcoming registrations</h3><p className="mt-1 text-sm text-[var(--cc-text-muted)]">When you register for an event, its date and details will appear here.</p></div><Link to="/dashboard/events" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--cc-primary)] hover:underline">Find an event <ArrowRight className="size-4" /></Link></div>}
    </section>}
  </div>;
}

function RegisteredEvent({ registration, event }) {
  const date = parseDate(event.start_date || event.date);
  const title = event.title || "Registered event";
  const identifier = event._id || event.slug;
  return <Link to={identifier ? `/dashboard/events/${encodeURIComponent(identifier)}` : "/dashboard/registrations"} className="group flex gap-4 rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 transition hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-sm)]">
    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--cc-primary-soft)] px-2 py-2 text-center text-[var(--cc-primary)]"><span className="text-[10px] font-bold uppercase tracking-wider">{date ? date.toLocaleDateString(undefined, { month: "short" }) : "Date"}</span><span className="mt-0.5 text-xl font-semibold leading-none">{date ? date.getDate() : "TBA"}</span><span className="mt-1 text-[10px]">{date?.getFullYear() || "Soon"}</span></div>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-[var(--cc-heading)]">{title}</h3><span className="rounded-full bg-[var(--cc-success-soft)] px-2 py-0.5 text-[10px] font-semibold capitalize text-[var(--cc-success)]">{statusOf(registration)}</span></div><p className="mt-1 text-xs text-[var(--cc-text-muted)]">{date ? date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date to be announced"}{event.time ? ` · ${event.time}` : ""}</p><p className="mt-1 truncate text-xs text-[var(--cc-text-soft)]">{event.location || event.venue || "Location to be announced"}</p></div>
    <ArrowRight className="mt-1 size-4 shrink-0 text-[var(--cc-text-soft)] transition-transform group-hover:translate-x-0.5" />
  </Link>;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
