import { Fragment, useEffect, useMemo, useState } from "react";
import { Code2, ExternalLink, Search, UsersRound, ArrowUpRight, Sparkles } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function ClubsPage({ dashboard = false }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const showDetails = dashboard || isAuthenticated;
  const PageLayout = dashboard ? Fragment : PublicLayout;
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [category, setCategory] = useState("All areas");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return undefined;
    let active = true;
    async function loadClubs() {
      setLoading(true); setError("");
      try {
        const response = showDetails ? await api.getClubDetails() : await api.getClubs();
        if (active) setClubs(response?.clubs || []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load clubs right now.");
      } finally { if (active) setLoading(false); }
    }
    loadClubs();
    return () => { active = false; };
  }, [authLoading, showDetails, reloadKey]);

  const categories = useMemo(() => ["All areas", ...new Set(clubs.map((club) => club.category).filter(Boolean))], [clubs]);
  const visibleClubs = useMemo(() => clubs.filter((club) => {
    const matchesCategory = category === "All areas" || club.category === category;
    const terms = `${club.name} ${club.category} ${club.summary} ${club.focus_areas?.join(" ") || ""}`.toLowerCase();
    return matchesCategory && terms.includes(search.trim().toLowerCase());
  }), [category, clubs, search]);

  return <PageLayout>
    <section className={dashboard ? "relative overflow-hidden rounded-[1.5rem] bg-[var(--cc-primary)] text-[var(--cc-on-primary)] shadow-[var(--cc-shadow-md)]" : "relative overflow-hidden border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]"}>
      <div className={`pointer-events-none absolute -right-24 -top-32 size-96 rounded-full blur-3xl ${dashboard ? "bg-white/10" : "bg-[var(--cc-primary-soft)]"}`} />
      {dashboard && <><div className="pointer-events-none absolute -right-8 -top-20 size-72 rounded-full border border-white/10" /><div className="pointer-events-none absolute -right-1 -top-12 size-52 rounded-full border border-white/10" /></>}
      <div className={dashboard ? "relative px-5 sm:px-7" : "container-page relative"}>
        <div className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center ${dashboard ? "py-6 sm:py-7" : "py-7 sm:py-9 lg:py-10"}`}>
          <div className="max-w-3xl"><p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] ${dashboard ? "text-white/75" : "text-[var(--cc-primary)]"}`}><Code2 className="size-4" /> Bennett University · Student communities</p><h1 className={`mt-3 font-semibold tracking-tight ${dashboard ? "text-2xl text-white sm:text-3xl lg:text-4xl" : "text-3xl text-[var(--cc-heading)] sm:text-4xl lg:text-[2.65rem]"}`}>{dashboard ? "Tech clubs at Bennett" : "Find your people. Build something."}</h1><p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 ${dashboard ? "text-white/75" : "text-[var(--cc-text-muted)]"}`}>From the first coding contest to robots, AI, security, and games, Bennett’s tech communities make room to learn by doing and share what you discover.</p></div>
          <div className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 ${dashboard ? "border-white/15 bg-white/10" : "border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]"}`}><span className={`flex size-10 items-center justify-center rounded-xl ${dashboard ? "bg-white/15 text-white" : "bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"}`}><UsersRound className="size-5" /></span><span><strong className={`block text-xl font-semibold ${dashboard ? "text-white" : "text-[var(--cc-heading)]"}`}>{loading ? "—" : clubs.length}</strong><span className={`text-xs ${dashboard ? "text-white/70" : "text-[var(--cc-text-muted)]"}`}>communities to explore</span></span></div>
        </div>
      </div>
    </section>

    <section className={dashboard ? "py-7" : "container-page py-8 sm:py-10"}>
      <div className="flex flex-col gap-4 border-b border-[var(--cc-border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cc-text-soft)]">Explore by interest</p><h2 className="mt-1 text-xl font-semibold text-[var(--cc-heading)]">{dashboard ? "Find a community that fits you" : "Tech communities at Bennett"}</h2></div>
        <label className="relative block w-full lg:max-w-xs"><span className="sr-only">Search tech clubs</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--cc-text-soft)]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clubs or interests" className="focus-ring h-11 w-full rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] pl-9 pr-3 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" /></label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter clubs by area">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${category === item ? "bg-[var(--cc-primary)] text-[var(--cc-on-primary)] shadow-sm" : "border border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text-muted)] hover:border-[var(--cc-border-strong)] hover:text-[var(--cc-text)]"}`}>{item}</button>)}</div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2 xl:gap-5">
        {loading ? Array.from({ length: 6 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)]" aria-hidden="true" />)
          : error ? <div className="col-span-full rounded-2xl border border-[var(--cc-danger)]/30 bg-[var(--cc-danger-soft)] p-6"><h2 className="font-semibold text-[var(--cc-heading)]">Clubs couldn’t be loaded</h2><p className="mt-2 text-sm text-[var(--cc-text-muted)]">{error}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-4 text-sm font-semibold text-[var(--cc-primary)] hover:underline">Try again</button></div>
            : visibleClubs.length ? visibleClubs.map((club, index) => <article key={club.slug} className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--cc-border-strong)] hover:shadow-[var(--cc-shadow-md)] sm:p-6">
              <span className="pointer-events-none absolute -right-9 -top-12 size-36 rounded-full bg-[var(--cc-primary-soft)] opacity-0 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Code2 className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-primary)]">{club.category || "Technology community"}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold tracking-tight text-[var(--cc-heading)]">{club.name}</h3><span className="rounded-full bg-[var(--cc-surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--cc-text-muted)]">{club.short_name}</span></div></div><span className="hidden text-xs font-semibold tabular-nums text-[var(--cc-text-soft)] sm:inline">{String(index + 1).padStart(2, "0")}</span></div>
              <p className="relative mt-4 flex-1 break-words text-sm leading-6 text-[var(--cc-text-muted)]">{showDetails ? (club.description || club.summary) : club.summary}</p>
              {showDetails && club.focus_areas?.length > 0 && <div className="relative mt-4 flex flex-wrap gap-1.5">{club.focus_areas.map((focus) => <span key={focus} className="rounded-md border border-[var(--cc-border)] px-2 py-1 text-[11px] text-[var(--cc-text-soft)]">{focus}</span>)}</div>}
              {showDetails && club.links?.length > 0 && <div className="relative mt-5 flex flex-wrap gap-4 border-t border-[var(--cc-border)] pt-4">{club.links.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--cc-primary)] hover:underline">{link.label}<ExternalLink className="size-3.5" /></a>)}</div>}
              {!showDetails && <div className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--cc-text-soft)]"><Sparkles className="size-3.5 text-[var(--cc-primary)]" />Sign in to see more club details</div>}
            </article>) : <div className="col-span-full rounded-2xl border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-14 text-center"><h2 className="font-semibold text-[var(--cc-heading)]">No matching clubs</h2><p className="mt-2 text-sm text-[var(--cc-text-muted)]">Try another area or search term.</p></div>}
      </div>
      {!showDetails && <p className="mt-5 text-xs leading-5 text-[var(--cc-text-soft)]">Club details are compiled from Bennett University’s public school and program information. Sign in to see additional descriptions and community links.</p>}
    </section>
  </PageLayout>;
}
