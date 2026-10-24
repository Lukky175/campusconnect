import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch { /* A failed refresh should not interrupt dashboard use. */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  const openNotification = async (item) => {
    if (!item.read) {
      try {
        await api.markNotificationRead(item._id);
        setNotifications((current) => current.map((notification) => notification._id === item._id ? { ...notification, read: true } : notification));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch { /* Keep navigation available even if marking read fails. */ }
    }
    setOpen(false);
    navigate(item.link?.startsWith("/") && !item.link.startsWith("//") && !item.link.startsWith("/\\") ? item.link : "/dashboard");
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch { /* The next refresh can reconcile the unread count. */ }
  };

  return <div className="relative">
    <button type="button" onClick={() => { setOpen((value) => !value); if (!open) loadNotifications(); }} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={open} className="focus-ring relative z-50 rounded-md p-2 text-[var(--cc-text-muted)] transition hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-text)]"><Bell className="size-4" />{unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cc-danger)] px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>
    {open && <>
      <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
      <section aria-label="Notifications" className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-md)]">
        <div className="flex items-center justify-between border-b border-[var(--cc-border)] px-4 py-3"><div><h2 className="text-sm font-semibold text-[var(--cc-heading)]">Notifications</h2><p className="text-xs text-[var(--cc-text-soft)]">Updates for your account and role</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--cc-primary)] hover:underline"><CheckCheck className="size-3.5" /> Mark all read</button>}</div>
        <div className="max-h-[min(70vh,28rem)] overflow-y-auto">{loading && !notifications.length ? <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--cc-text-muted)]"><LoaderCircle className="size-4 animate-spin" /> Loading…</div> : notifications.length ? notifications.map((item) => <article key={item._id} className={`border-b border-[var(--cc-border)] px-4 py-3 transition last:border-0 hover:bg-[var(--cc-surface-subtle)] ${item.read ? "opacity-75" : "bg-[var(--cc-primary-soft)]/40"}`}><div className="flex items-start gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-[var(--cc-primary)]"}`} /><div className="min-w-0 flex-1"><button type="button" onClick={() => openNotification(item)} className="focus-ring block w-full text-left"><span className="block text-sm font-semibold text-[var(--cc-heading)]">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-[var(--cc-text-muted)]">{item.body}</span><time className="mt-1 block text-[10px] text-[var(--cc-text-soft)]">{formatDate(item.created_at)}</time></button>{item.actor?._id && <Link to={`/dashboard/users/${encodeURIComponent(item.actor._id)}/profile`} onClick={() => { setOpen(false); if (!item.read) { api.markNotificationRead(item._id).catch(() => {}); setNotifications((current) => current.map((note) => note._id === item._id ? { ...note, read: true } : note)); setUnreadCount((count) => Math.max(0, count - 1)); } }} className="mt-1 inline-block text-[11px] font-medium text-[var(--cc-primary)] hover:underline">View {item.actor.name || (item.actor.username ? `@${item.actor.username}` : "member")}&apos;s profile</Link>}</div></div></article>) : <p className="p-8 text-center text-sm text-[var(--cc-text-muted)]">You’re all caught up.</p>}</div>
      </section>
    </>}
  </div>;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
