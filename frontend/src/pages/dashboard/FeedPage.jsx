import { useEffect, useState } from "react";
import { Bookmark, ChevronDown, Flag, Heart, LoaderCircle, MessageCircle, MessagesSquare, RefreshCw, Send, ShieldBan, Smile, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

const EMOJIS = ["😀", "😂", "🥹", "❤️", "🙌", "🎉", "🤔", "✨", "👍", "🔥", "💡", "🙏"];
const REPORT_REASONS = [
  ["spam", "Spam or misleading content"],
  ["harassment", "Harassment or bullying"],
  ["inappropriate", "Inappropriate content"],
  ["misinformation", "Potential misinformation"],
  ["other", "Other concern"],
];

export default function FeedPage() {
  const { user, role } = useAuth();
  const toast = useToast();
  const isAdmin = role === "admin";
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pending, setPending] = useState(() => new Set());
  const [openComments, setOpenComments] = useState(() => new Set());
  const [comments, setComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(() => new Set());
  const [commentPending, setCommentPending] = useState(() => new Set());
  const [openMenu, setOpenMenu] = useState("");
  const [reportingPost, setReportingPost] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [blockedLoading, setBlockedLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setPosts([]);
    setCursor(null);
    api.getFeed({ saved: activeTab === "saved" })
      .then((data) => {
        if (!active) return;
        setPosts(data.posts || []);
        setCursor(data.next_cursor || null);
        setHasMore(Boolean(data.has_more));
      })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load the campus feed."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeTab, toast]);

  const reloadFeed = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.getFeed({ saved: activeTab === "saved" });
      setPosts(data.posts || []);
      setCursor(data.next_cursor || null);
      setHasMore(Boolean(data.has_more));
    } catch (error) {
      toast.error(error.message || "Unable to load the campus feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await api.getFeed({ before: cursor, saved: activeTab === "saved" });
      setPosts((current) => [...current, ...(data.posts || [])]);
      setCursor(data.next_cursor || null);
      setHasMore(Boolean(data.has_more));
    } catch (error) {
      toast.error(error.message || "Unable to load more posts.");
    } finally {
      setLoadingMore(false);
    }
  };

  const publish = async (event) => {
    event.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    try {
      const data = await api.createFeedPost(body.trim());
      setActiveTab("latest");
      setPosts((current) => [data.post, ...current]);
      setBody("");
      toast.success("Your post is now in the campus feed.");
    } catch (error) {
      toast.error(error.message || "Unable to publish your post.");
    } finally {
      setPosting(false);
    }
  };

  const toggleReaction = async (post) => {
    if (pending.has(post._id)) return;
    setPending((current) => new Set(current).add(post._id));
    try {
      const data = await api.toggleFeedReaction(post._id);
      setPosts((current) => current.map((item) => item._id === post._id
        ? { ...item, reacted_by_me: data.reacted, reaction_count: data.reaction_count }
        : item));
    } catch (error) {
      toast.error(error.message || "Unable to update your reaction.");
    } finally {
      setPending((current) => removeFromSet(current, post._id));
    }
  };

  const toggleSave = async (post) => {
    if (pending.has(post._id)) return;
    setPending((current) => new Set(current).add(post._id));
    try {
      const data = await api.toggleFeedSave(post._id);
      setPosts((current) => data.saved || activeTab !== "saved"
        ? current.map((item) => item._id === post._id ? { ...item, saved_by_me: data.saved } : item)
        : current.filter((item) => item._id !== post._id));
      toast.success(data.saved ? "Post saved." : "Post removed from your saved list.");
    } catch (error) {
      toast.error(error.message || "Unable to update your saved posts.");
    } finally {
      setPending((current) => removeFromSet(current, post._id));
    }
  };

  const toggleComments = async (postId) => {
    if (openComments.has(postId)) {
      setOpenComments((current) => removeFromSet(current, postId));
      return;
    }
    setOpenComments((current) => new Set(current).add(postId));
    if (comments[postId]) return;
    setCommentsLoading((current) => new Set(current).add(postId));
    try {
      const data = await api.getFeedComments(postId);
      setComments((current) => ({ ...current, [postId]: data.comments || [] }));
    } catch (error) {
      toast.error(error.message || "Unable to load comments.");
    } finally {
      setCommentsLoading((current) => removeFromSet(current, postId));
    }
  };

  const submitComment = async (event, postId) => {
    event.preventDefault();
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft || commentPending.has(postId)) return;
    setCommentPending((current) => new Set(current).add(postId));
    try {
      const data = await api.createFeedComment(postId, draft);
      setComments((current) => ({ ...current, [postId]: [...(current[postId] || []), data.comment] }));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      setPosts((current) => current.map((post) => post._id === postId ? { ...post, comment_count: (post.comment_count || 0) + 1 } : post));
    } catch (error) {
      toast.error(error.message || "Unable to add your comment.");
    } finally {
      setCommentPending((current) => removeFromSet(current, postId));
    }
  };

  const toggleCommentReaction = async (commentId, postId) => {
    const key = `comment:${commentId}`;
    if (pending.has(key)) return;
    setPending((current) => new Set(current).add(key));
    try {
      const data = await api.toggleFeedCommentReaction(commentId);
      setComments((current) => ({
        ...current,
        [postId]: (current[postId] || []).map((comment) => comment._id === commentId
          ? { ...comment, reacted_by_me: data.reacted, reaction_count: data.reaction_count }
          : comment),
      }));
    } catch (error) {
      toast.error(error.message || "Unable to update comment reaction.");
    } finally {
      setPending((current) => removeFromSet(current, key));
    }
  };

  const blockAuthor = async (post) => {
    setOpenMenu("");
    if (!window.confirm(`Hide posts from ${post.author?.name || "this account"}? You can unblock the account later.`)) return;
    try {
      await api.blockFeedAuthor(post._id);
      setPosts((current) => current.filter((item) => item.author?._id !== post.author?._id));
      toast.success("Posts from this account are now hidden.");
    } catch (error) {
      toast.error(error.message || "Unable to block this account.");
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!reportingPost || reporting) return;
    setReporting(true);
    try {
      await api.reportFeedPost(reportingPost._id, { reason: reportReason, details: reportDetails });
      setReportingPost(null);
      setReportDetails("");
      setOpenMenu("");
      toast.success("Thanks. Your report has been sent to the admins.");
    } catch (error) {
      toast.error(error.message || "Unable to submit your report.");
    } finally {
      setReporting(false);
    }
  };

  const deletePost = async (post) => {
    setOpenMenu("");
    if (!window.confirm("Remove this post from the campus feed?")) return;
    try {
      await api.deleteFeedPost(post._id);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      toast.success("Post removed from the campus feed.");
    } catch (error) {
      toast.error(error.message || "Unable to remove the post.");
    }
  };

  const openBlockedUsers = async () => {
    setBlockedUsers([]);
    setBlockedLoading(true);
    try {
      const data = await api.getBlockedFeedUsers();
      setBlockedUsers(data.users || []);
    } catch (error) {
      setBlockedUsers(null);
      toast.error(error.message || "Unable to load blocked accounts.");
    } finally {
      setBlockedLoading(false);
    }
  };

  const unblockUser = async (blockedUser) => {
    try {
      await api.unblockFeedUser(blockedUser._id);
      setBlockedUsers((current) => current.filter((item) => item._id !== blockedUser._id));
      toast.success(`${blockedUser.name} can appear in your feed again.`);
    } catch (error) {
      toast.error(error.message || "Unable to unblock this account.");
    }
  };

  const addEmoji = (value, setter, textareaId) => {
    setter((current) => `${current}${value}`);
    document.getElementById(textareaId)?.focus();
  };

  return <div className="mx-auto max-w-3xl">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-[var(--cc-primary)]">Bennett University</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-3xl">Campus Feed</h1><p className="mt-2 text-sm text-[var(--cc-text-muted)]">Ideas, questions, and updates from across campus.</p></div>
      <button type="button" onClick={() => reloadFeed(true)} disabled={refreshing || loading} className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 text-sm font-medium text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] disabled:opacity-60"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh</button>
    </header>

    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cc-border)]">
      <div className="flex gap-1" role="tablist" aria-label="Feed posts">
        {["latest", "saved"].map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`focus-ring rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition ${activeTab === tab ? "border-[var(--cc-primary)] text-[var(--cc-primary)]" : "border-transparent text-[var(--cc-text-muted)] hover:text-[var(--cc-text)]"}`}>{tab === "latest" ? "Latest posts" : "Saved posts"}</button>)}
      </div>
      <button type="button" onClick={openBlockedUsers} className="focus-ring mb-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><ShieldBan className="size-3.5" /> Manage blocked users</button>
    </div>

    {activeTab === "latest" && <form onSubmit={publish} className="mb-6 rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)] sm:p-5">
      <div className="flex items-center gap-3"><Avatar name={user?.name} /><p className="text-sm font-semibold text-[var(--cc-heading)]">Share with your campus</p></div>
      <label className="sr-only" htmlFor="feed-post">Write a post</label>
      <textarea id="feed-post" value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={4} placeholder="What’s on your mind? Share an idea, ask a question, or post an update…" className="focus-ring mt-4 w-full resize-y rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-bg)] p-3.5 text-sm leading-6 text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2"><EmojiRow onSelect={(emoji) => addEmoji(emoji, setBody, "feed-post")} /><span className="text-xs text-[var(--cc-text-soft)]">{body.length.toLocaleString()} / 5,000</span></div><Button type="submit" loading={posting} disabled={!body.trim()}><Send className="size-4" /> Post</Button></div>
    </form>}

    <div className="space-y-4">
      {loading ? <FeedSkeleton /> : posts.length ? posts.map((post) => <article key={post._id} className="overflow-visible rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            {isAdmin && post.author?._id ? <Link to={`/dashboard/admin/users/${encodeURIComponent(post.author._id)}/profile`} aria-label={`View ${post.author.name}'s profile`} className="focus-ring rounded-full"><Avatar name={post.author?.name} /></Link> : <Avatar name={post.author?.name} />}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[var(--cc-heading)]">{post.author?.name || "CampusConnect member"}</p><p className="mt-0.5 text-xs text-[var(--cc-text-soft)]"><time dateTime={post.created_at}>{formatTimestamp(post.created_at)}</time><span className="mx-1.5">·</span><span className="capitalize">{(post.author?.role || "student").replaceAll("_", " ")}</span></p></div>
            <div className="relative">
              <button type="button" aria-label="Post options" aria-expanded={openMenu === post._id} onClick={() => setOpenMenu((current) => current === post._id ? "" : post._id)} className="focus-ring flex size-9 items-center justify-center rounded-full text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><ChevronDown className="size-4" /></button>
              {openMenu === post._id && <div className="absolute right-0 top-10 z-20 w-52 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface-raised)] p-1.5 shadow-[var(--cc-shadow-md)]" role="menu">
                <button type="button" role="menuitem" onClick={() => blockAuthor(post)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"><ShieldBan className="size-4" /> Block this user</button>
                <button type="button" role="menuitem" onClick={() => { setReportingPost(post); setReportReason("spam"); setReportDetails(""); setOpenMenu(""); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"><Flag className="size-4" /> Report post</button>
                {isAdmin && <button type="button" role="menuitem" onClick={() => deletePost(post)} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"><Trash2 className="size-4" /> Delete post</button>}
              </div>}
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--cc-text)]">{post.body}</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--cc-border)] px-3 py-2 sm:px-4">
          <div className="flex items-center gap-1">
            <button type="button" disabled={pending.has(post._id)} onClick={() => toggleReaction(post)} aria-pressed={post.reacted_by_me} className={`focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors disabled:opacity-60 ${post.reacted_by_me ? "bg-[var(--cc-primary-soft)] font-medium text-[var(--cc-primary)]" : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"}`}><Heart className={`size-4 ${post.reacted_by_me ? "fill-current" : ""}`} />{post.reaction_count || 0}<span>{post.reacted_by_me ? "Liked" : "Like"}</span></button>
            <button type="button" aria-expanded={openComments.has(post._id)} onClick={() => toggleComments(post._id)} className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><MessageCircle className="size-4" />{post.comment_count || 0}<span>Comment</span></button>
          </div>
          <button type="button" disabled={pending.has(post._id)} onClick={() => toggleSave(post)} aria-pressed={post.saved_by_me} className={`focus-ring inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors disabled:opacity-60 ${post.saved_by_me ? "bg-[var(--cc-primary-soft)] font-medium text-[var(--cc-primary)]" : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"}`}><Bookmark className={`size-4 ${post.saved_by_me ? "fill-current" : ""}`} /><span>{post.saved_by_me ? "Saved" : "Save"}</span></button>
        </div>
        {openComments.has(post._id) && <div className="border-t border-[var(--cc-border)] bg-[var(--cc-bg)]/50 px-4 py-4 sm:px-5">
          {commentsLoading.has(post._id) ? <div className="flex items-center gap-2 py-3 text-sm text-[var(--cc-text-muted)]"><LoaderCircle className="size-4 animate-spin" /> Loading comments…</div> : <div className="mb-4 space-y-4">
            {(comments[post._id] || []).map((comment) => <div key={comment._id} className="flex gap-3">
              {isAdmin && comment.author?._id ? <Link to={`/dashboard/admin/users/${encodeURIComponent(comment.author._id)}/profile`} aria-label={`View ${comment.author.name}'s profile`}><Avatar name={comment.author?.name} small /></Link> : <Avatar name={comment.author?.name} small />}
              <div className="min-w-0 flex-1 rounded-lg bg-[var(--cc-surface)] px-3.5 py-2.5"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-xs font-semibold text-[var(--cc-heading)]">{comment.author?.name || "CampusConnect member"}</p><time dateTime={comment.created_at} className="text-[11px] text-[var(--cc-text-soft)]">{formatTimestamp(comment.created_at)}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--cc-text)]">{comment.body}</p>
                <button type="button" disabled={pending.has(`comment:${comment._id}`)} onClick={() => toggleCommentReaction(comment._id, post._id)} aria-pressed={comment.reacted_by_me} className={`focus-ring mt-2 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs ${comment.reacted_by_me ? "font-semibold text-[var(--cc-primary)]" : "text-[var(--cc-text-soft)] hover:bg-[var(--cc-surface-subtle)]"}`}><Heart className={`size-3.5 ${comment.reacted_by_me ? "fill-current" : ""}`} />{comment.reaction_count || 0}<span>Like</span></button>
              </div>
            </div>)}
            {(comments[post._id] || []).length === 0 && <p className="py-2 text-sm text-[var(--cc-text-muted)]">No comments yet. Start the conversation.</p>}
            {(comments[post._id] || []).length >= 100 && post.comment_count > 100 && <p className="text-xs text-[var(--cc-text-soft)]">Showing the latest 100 comments.</p>}
          </div>}
          <form onSubmit={(event) => submitComment(event, post._id)} className="flex items-end gap-2.5">
            <div className="min-w-0 flex-1"><label className="sr-only" htmlFor={`comment-${post._id}`}>Write a comment</label><textarea id={`comment-${post._id}`} value={commentDrafts[post._id] || ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))} rows={1} maxLength={2000} placeholder="Write a comment…" className="focus-ring min-h-10 max-h-32 w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" /><EmojiRow onSelect={(emoji) => { setCommentDrafts((current) => ({ ...current, [post._id]: `${current[post._id] || ""}${emoji}` })); document.getElementById(`comment-${post._id}`)?.focus(); }} compact /></div>
            <Button type="submit" aria-label="Send comment" loading={commentPending.has(post._id)} disabled={!(commentDrafts[post._id] || "").trim()} className="size-10 min-h-10 shrink-0 rounded-[var(--cc-radius-sm)] p-0">{!commentPending.has(post._id) && <Send className="size-4" />}</Button>
          </form>
        </div>}
      </article>) : <div className="rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-12 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><MessagesSquare className="size-5" /></span><h2 className="mt-4 text-base font-semibold text-[var(--cc-heading)]">{activeTab === "saved" ? "No saved posts yet" : "The campus feed starts here"}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--cc-text-muted)]">{activeTab === "saved" ? "Save posts to keep them handy. They’ll be listed here." : "Share a question, an idea, or a useful update with other Bennett students."}</p></div>}
    </div>

    {hasMore && !loading && <div className="py-7 text-center"><Button type="button" variant="secondary" loading={loadingMore} onClick={loadMore}>Load more posts</Button></div>}

    {reportingPost && <ReportDialog post={reportingPost} reason={reportReason} setReason={setReportReason} details={reportDetails} setDetails={setReportDetails} loading={reporting} onCancel={() => setReportingPost(null)} onSubmit={submitReport} />}
    {blockedUsers !== null && <BlockedUsersDialog users={blockedUsers} loading={blockedLoading} onUnblock={unblockUser} onClose={() => setBlockedUsers(null)} />}
  </div>;
}

function ReportDialog({ post, reason, setReason, details, setDetails, loading, onCancel, onSubmit }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="report-title" className="mx-auto my-10 max-w-lg rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-md)] sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--cc-primary)]">Help keep the feed useful</p><h2 id="report-title" className="mt-1 text-xl font-semibold text-[var(--cc-heading)]">Report this post</h2></div><button type="button" onClick={onCancel} aria-label="Close report form" className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><X className="size-4" /></button></div>
    <p className="mt-3 line-clamp-3 rounded-md bg-[var(--cc-bg)] p-3 text-sm text-[var(--cc-text-muted)]">{post.body}</p>
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Why are you reporting this?</span><select value={reason} onChange={(event) => setReason(event.target.value)} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]">{REPORT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Additional details <span className="font-normal text-[var(--cc-text-soft)]">(optional)</span></span><textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={3} maxLength={1000} className="focus-ring w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 py-2.5 text-sm text-[var(--cc-text)]" placeholder="Add context to help the admins review…" /></label>
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" loading={loading}><Flag className="size-4" /> Send report</Button></div>
    </form>
  </section></div>;
}

function BlockedUsersDialog({ users, loading, onUnblock, onClose }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="blocked-title" className="mx-auto my-10 max-w-lg rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-md)] sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-[var(--cc-primary)]">Your feed preferences</p><h2 id="blocked-title" className="mt-1 text-xl font-semibold text-[var(--cc-heading)]">Blocked accounts</h2></div><button type="button" onClick={onClose} aria-label="Close blocked accounts" className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><X className="size-4" /></button></div>
    {loading ? <div className="flex items-center gap-2 py-8 text-sm text-[var(--cc-text-muted)]"><LoaderCircle className="size-4 animate-spin" /> Loading…</div> : users.length ? <ul className="mt-5 divide-y divide-[var(--cc-border)]">{users.map((item) => <li key={item._id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><Avatar name={item.name} small /><div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--cc-heading)]">{item.name}</p><p className="text-xs capitalize text-[var(--cc-text-soft)]">{item.role?.replaceAll("_", " ")}</p></div></div><Button type="button" variant="secondary" className="min-h-9 px-3" onClick={() => onUnblock(item)}>Unblock</Button></li>)}</ul> : <p className="mt-5 rounded-lg bg-[var(--cc-bg)] p-4 text-sm text-[var(--cc-text-muted)]">You haven’t blocked anyone.</p>}
  </section></div>;
}

function EmojiRow({ onSelect, compact = false }) {
  return <details className="group relative inline-block">
    <summary aria-label="Choose emoji" className="focus-ring flex size-8 cursor-pointer list-none items-center justify-center rounded-md text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><Smile className="size-4" /></summary>
    <div className={`absolute bottom-10 left-0 z-20 grid ${compact ? "w-48 grid-cols-6" : "w-56 grid-cols-6"} gap-1 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface-raised)] p-2 shadow-[var(--cc-shadow-md)]`}>
      {EMOJIS.map((emoji) => <button key={emoji} type="button" onClick={(event) => { onSelect(emoji); event.currentTarget.closest("details")?.removeAttribute("open"); }} aria-label={`Insert ${emoji}`} className="flex size-8 items-center justify-center rounded hover:bg-[var(--cc-surface-subtle)]">{emoji}</button>)}
    </div>
  </details>;
}

function Avatar({ name, small = false }) {
  const initials = (name || "CC").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] font-semibold text-[var(--cc-primary)] ${small ? "size-7 text-[10px]" : "size-10 text-xs"}`} aria-hidden="true">{initials || "CC"}</span>;
}

function FeedSkeleton() {
  return <>{[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]" />)}</>;
}

function removeFromSet(current, item) { const next = new Set(current); next.delete(item); return next; }

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(seconds) < 60) return relative.format(seconds, "second");
  if (Math.abs(seconds) < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  if (Math.abs(seconds) < 604800) return relative.format(Math.round(seconds / 86400), "day");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}
