import { Github, Linkedin, ExternalLink, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "U";

  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="text-center">
      <p className="text-sm font-medium text-[var(--cc-primary)]">Your campus identity</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)] md:text-3xl">Profile</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--cc-text-muted)]">A clear view of the details and links you share with the CampusConnect community.</p>
    </header>

    <section className="mx-auto max-w-4xl overflow-hidden rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="h-28 bg-gradient-to-r from-[var(--cc-primary)] via-[var(--cc-primary-hover)] to-[var(--cc-accent)] sm:h-36" />
      <div className="px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-12 flex flex-col items-center text-center sm:-mt-14">
          <div className="flex size-24 items-center justify-center rounded-full border-4 border-[var(--cc-surface)] bg-[var(--cc-primary-soft)] text-3xl font-semibold text-[var(--cc-primary)] shadow-[var(--cc-shadow-sm)] sm:size-28">{initial}</div>
          <h2 className="mt-3 text-xl font-semibold text-[var(--cc-heading)] sm:text-2xl">{user?.name || "CampusConnect member"}</h2>
          {user?.username && <p className="mt-1 rounded-full bg-[var(--cc-bg)] px-3 py-1 text-sm font-medium text-[var(--cc-primary)]">@{user.username}</p>}
          <p className="mt-1 text-sm text-[var(--cc-text-muted)]">{user?.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--cc-primary-soft)] px-3 py-1 text-xs font-semibold capitalize text-[var(--cc-primary)]"><UserRound className="size-3.5" />{(user?.role || "student").replaceAll("_", " ")}</span>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <ProfileField label="University" value={user?.college_name || "Bennett University"} />
          <ProfileField label="Enrollment ID" value={user?.enrollment_id} />
        </div>

        <div className="mx-auto mt-7 max-w-3xl border-t border-[var(--cc-border)] pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-semibold text-[var(--cc-heading)]">Links and work</h3><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Share professional profiles and a link to your resume.</p></div><Link to="/dashboard/settings" className="text-sm font-semibold text-[var(--cc-primary)] hover:underline">Manage links in settings</Link></div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ProfileLink icon={Linkedin} label="LinkedIn" url={user?.linkedin_url} />
            <ProfileLink icon={Github} label="GitHub" url={user?.github_url} />
            <ProfileLink icon={ExternalLink} label="Resume" url={user?.resume_url} />
          </div>
        </div>
      </div>
    </section>
  </div>;
}

function ProfileField({ label, value }) {
  return <div className="rounded-[var(--cc-radius-md)] bg-[var(--cc-bg)] px-4 py-3 text-center sm:text-left"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">{label}</p><p className="mt-1.5 break-words text-sm font-medium text-[var(--cc-text)]">{value || "Not provided"}</p></div>;
}

function ProfileLink({ icon: Icon, label, url }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs text-[var(--cc-text-soft)]">{label}</p>{url ? <a href={url} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-sm font-medium text-[var(--cc-primary)] hover:underline">Open {label}<ExternalLink className="size-3 shrink-0" /></a> : <p className="mt-0.5 text-sm text-[var(--cc-text-muted)]">Not added yet</p>}</div></div>;
}
