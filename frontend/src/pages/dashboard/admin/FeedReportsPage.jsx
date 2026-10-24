import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, ExternalLink, Flag, RefreshCw, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/Button";
import { useToast } from "../../../context/ToastContext";
import { api } from "../../../services/api";

const reasonLabels = {
  spam: "Spam or misleading content",
  harassment: "Harassment or bullying",
  inappropriate: "Inappropriate content",
  misinformation: "Potential misinformation",
  other: "Other concern",
};

export default function FeedReportsPage() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFeedReports();
      setReports(data.reports || []);
    } catch (error) {
      toast.error(error.message || "Unable to load feed reports.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const updateStatus = async (report, status) => {
    setPending(report._id);
    try {
      await api.updateFeedReport(report._id, status);
      setReports((current) => current.filter((item) => item._id !== report._id));
      toast.success(status === "reviewed" ? "Report marked as reviewed." : "Report dismissed.");
    } catch (error) {
      toast.error(error.message || "Unable to update this report.");
    } finally {
      setPending("");
    }
  };

  const removePost = async (report) => {
    if (!window.confirm("Remove this post from the campus feed? The report will remain here until you review or dismiss it.")) return;
    setPending(report._id);
    try {
      await api.deleteFeedPost(report.post_id);
      setReports((current) => current.map((item) => item._id === report._id
        ? { ...item, post: { ...item.post, body: "This post was removed by an administrator.", status: "removed" } }
        : item));
      toast.success("Post removed from the campus feed.");
    } catch (error) {
      toast.error(error.message || "Unable to remove this post.");
    } finally {
      setPending("");
    }
  };

  return <div className="mx-auto max-w-5xl">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-[var(--cc-primary)]">Feed moderation</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">Feed Reports</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">Review posts reported by students. Remove content from the feed, mark a report reviewed, or dismiss it.</p></div>
      <Button variant="secondary" type="button" onClick={loadReports} loading={loading}><RefreshCw className="size-4" /> Refresh</Button>
    </header>
    {loading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-[var(--cc-radius-lg)] bg-[var(--cc-surface)]" />)}</div>
      : reports.length ? <div className="space-y-4">
        {reports.map((report) => <article key={report._id} className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-warning)]/40 bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--cc-warning-soft)] text-[var(--cc-warning)]"><AlertTriangle className="size-4" /></span><div><p className="text-sm font-semibold text-[var(--cc-heading)]">{reasonLabels[report.reason] || "Reported post"}</p><p className="mt-1 text-xs text-[var(--cc-text-muted)]">Reported by {report.reporter?.name || "a campus member"} · {formatDate(report.created_at)}</p></div></div>
            <span className="rounded-full bg-[var(--cc-warning-soft)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--cc-warning)]">{report.post?.status === "removed" ? "Post removed" : "Needs review"}</span>
          </div>
          <blockquote className="mt-5 whitespace-pre-wrap break-words rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] p-4 text-sm leading-6 text-[var(--cc-text)]">{report.post?.body || "Post unavailable"}</blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--cc-text-muted)]">
            <span>Reason: <strong className="font-medium text-[var(--cc-text)]">{reasonLabels[report.reason] || report.reason}</strong></span>
            {report.details && <span className="max-w-full">Reporter note: {report.details}</span>}
            {report.post?.author?._id && <Link to={`/dashboard/admin/users/${encodeURIComponent(report.post.author._id)}/profile`} className="inline-flex items-center gap-1 font-medium text-[var(--cc-primary)] hover:underline">View author profile <ExternalLink className="size-3.5" /></Link>}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--cc-border)] pt-4">
            {report.post?.status !== "removed" && <Button type="button" variant="danger" loading={pending === report._id} onClick={() => removePost(report)}><Trash2 className="size-4" /> Remove post</Button>}
            <Button type="button" variant="secondary" disabled={Boolean(pending)} onClick={() => updateStatus(report, "reviewed")}><Check className="size-4" /> Mark reviewed</Button>
            <Button type="button" variant="ghost" disabled={Boolean(pending)} onClick={() => updateStatus(report, "dismissed")}><X className="size-4" /> Dismiss report</Button>
          </div>
        </article>)}
      </div> : <div className="rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-14 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--cc-success-soft)] text-[var(--cc-success)]"><Flag className="size-5" /></span><h2 className="mt-4 text-base font-semibold text-[var(--cc-heading)]">You’re all caught up</h2><p className="mt-2 text-sm text-[var(--cc-text-muted)]">New student reports will appear here for review.</p></div>}
  </div>;
}

function formatDate(value) {
  if (!value) return "recently";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
