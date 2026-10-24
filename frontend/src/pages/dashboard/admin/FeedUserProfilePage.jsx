import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

export default function FeedUserProfilePage() {
  const { userId } = useParams();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getFeedUserProfile(userId)
      .then((data) => { if (active) setProfile(data.user); })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load this profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, toast]);

  if (loading) return <div className="py-16 text-center text-sm text-[var(--cc-text-muted)]">Loading profile…</div>;
  if (!profile) return <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-8 text-center"><h1 className="text-lg font-semibold text-[var(--cc-heading)]">Profile unavailable</h1><p className="mt-2 text-sm text-[var(--cc-text-muted)]">This account may have been removed.</p><Link to="/dashboard/admin/feed-reports" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-primary)] hover:underline"><ArrowLeft className="size-4" /> Back to feed reports</Link></section>;

  const details = [
    { label: "Email address", value: profile.email, icon: Mail },
    { label: "Role", value: profile.role?.replaceAll("_", " "), icon: ShieldCheck },
    { label: "College / department", value: profile.college, icon: UserRound },
    { label: "Enrollment ID", value: profile.enrollment_id, icon: UserRound },
    { label: "Joined CampusConnect", value: formatDate(profile.created_at), icon: CalendarDays },
    { label: "Account status", value: profile.is_active ? "Active" : "Inactive", icon: ShieldCheck },
  ].filter((item) => item.value);

  return <div className="mx-auto max-w-3xl">
    <Link to="/dashboard/admin/feed-reports" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-text-muted)] hover:text-[var(--cc-primary)]"><ArrowLeft className="size-4" /> Back to feed reports</Link>
    <section className="overflow-hidden rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="h-28 bg-[var(--cc-primary-soft)]" />
      <div className="px-5 pb-6 sm:px-8">
        <span className="-mt-9 flex size-[4.5rem] items-center justify-center rounded-full border-4 border-[var(--cc-surface)] bg-[var(--cc-primary)] text-2xl font-semibold text-[var(--cc-on-primary)]">{profile.name?.trim()?.[0]?.toUpperCase() || "U"}</span>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--cc-primary)]">Administrator view</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)]">{profile.name || "Campus member"}</h1>
        <p className="mt-1 text-sm text-[var(--cc-text-muted)]">This profile is visible only to administrators.</p>
        <dl className="mt-7 grid gap-3 sm:grid-cols-2">{details.map(({ label, value, icon: Icon }) => <div key={label} className="flex gap-3 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] p-4"><Icon className="mt-0.5 size-4 shrink-0 text-[var(--cc-primary)]" /><div><dt className="text-xs font-medium text-[var(--cc-text-soft)]">{label}</dt><dd className="mt-1 break-words text-sm font-medium capitalize text-[var(--cc-text)]">{value}</dd></div></div>)}</dl>
      </div>
    </section>
  </div>;
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
