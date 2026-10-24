import { useEffect, useState } from "react";
import { ArrowLeft, Github, Linkedin, FileText, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function CommunityProfilePage() {
  const { userId } = useParams();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getCommunityProfile(userId)
      .then((data) => { if (active) setProfile(data.user); })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load this profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, toast]);

  if (loading) return <div className="py-16 text-center text-sm text-[var(--cc-text-muted)]">Loading profile…</div>;
  if (!profile) return <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-8 text-center"><h1 className="text-lg font-semibold text-[var(--cc-heading)]">Profile unavailable</h1><p className="mt-2 text-sm text-[var(--cc-text-muted)]">This account may no longer be available.</p><Link to="/dashboard/feed" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-primary)] hover:underline"><ArrowLeft className="size-4" /> Back to Campus Feed</Link></section>;

  const links = [
    ["LinkedIn", profile.linkedin_url, Linkedin],
    ["GitHub", profile.github_url, Github],
    ["Resume", profile.resume_url, FileText],
  ].filter(([, href]) => href);

  return <div className="mx-auto max-w-3xl">
    <Link to="/dashboard/feed" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-text-muted)] hover:text-[var(--cc-primary)]"><ArrowLeft className="size-4" /> Back to Campus Feed</Link>
    <section className="overflow-hidden rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="h-28 bg-gradient-to-r from-[var(--cc-primary-soft)] via-[var(--cc-surface-subtle)] to-[var(--cc-primary-soft)]" />
      <div className="px-5 pb-7 sm:px-8"><span className="-mt-9 flex size-[4.5rem] items-center justify-center rounded-full border-4 border-[var(--cc-surface)] bg-[var(--cc-primary)] text-2xl font-semibold text-white"><UserRound className="size-7" /></span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--cc-primary)]">CampusConnect member</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)]">{profile.name || "Campus member"}</h1>
        <p className="mt-1 text-sm text-[var(--cc-text-muted)]">{profile.username ? `@${profile.username}` : "Bennett University"} · {profile.role?.replaceAll("_", " ") || "student"}</p>
        {links.length > 0 && <div className="mt-7 flex flex-wrap gap-3">{links.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--cc-border)] px-3.5 text-sm font-medium text-[var(--cc-text)] transition hover:border-[var(--cc-primary)] hover:text-[var(--cc-primary)]"><Icon className="size-4" />{label}</a>)}</div>}
        {!links.length && <p className="mt-6 rounded-lg bg-[var(--cc-bg)] p-4 text-sm text-[var(--cc-text-muted)]">This member has not added profile links yet.</p>}
      </div>
    </section>
  </div>;
}
