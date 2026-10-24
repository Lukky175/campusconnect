import { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

const LINK_FIELDS = [
  { key: "linkedin_url", label: "LinkedIn profile", placeholder: "https://www.linkedin.com/in/your-name" },
  { key: "github_url", label: "GitHub profile", placeholder: "https://github.com/your-name" },
  { key: "resume_url", label: "Resume link", placeholder: "https://drive.google.com/file/d/..." },
];

export default function DashboardSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [links, setLinks] = useState({ linkedin_url: "", github_url: "", resume_url: "" });
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState({ current_password: "", new_password: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [usernameRequest, setUsernameRequest] = useState({ new_username: "", reason: "" });
  const [usernameRequests, setUsernameRequests] = useState([]);
  const [usernameRequestSaving, setUsernameRequestSaving] = useState(false);
  const hasPendingUsernameRequest = usernameRequests.some((item) => item.status === "pending");

  useEffect(() => {
    setLinks({
      linkedin_url: user?.linkedin_url || "",
      github_url: user?.github_url || "",
      resume_url: user?.resume_url || "",
    });
  }, [user?.linkedin_url, user?.github_url, user?.resume_url]);

  useEffect(() => {
    if (!user?.permissions?.includes("profile.request_username_change")) return;
    api.getMyUsernameChangeRequests().then((data) => setUsernameRequests(data.requests || [])).catch(() => {});
  }, [user?.permissions]);

  const submitUsernameRequest = async (event) => {
    event.preventDefault();
    setUsernameRequestSaving(true);
    try {
      await api.createUsernameChangeRequest(usernameRequest);
      setUsernameRequest({ new_username: "", reason: "" });
      const data = await api.getMyUsernameChangeRequests();
      setUsernameRequests(data.requests || []);
      toast.success("Username change request sent for review.");
    } catch (error) {
      toast.error(error.message || "Unable to submit the username request.");
    } finally { setUsernameRequestSaving(false); }
  };

  const saveLinks = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await api.updateMyProfile(links);
      await refreshUser();
      toast.success("Profile links saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save profile links.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.new_password !== password.confirm) return toast.error("The new passwords do not match.");
    setPasswordSaving(true);
    try {
      await api.changePassword({ current_password: password.current_password, new_password: password.new_password });
      setPassword({ current_password: "", new_password: "", confirm: "" });
      await refreshUser();
      toast.success("Password updated securely.");
    } catch (error) {
      toast.error(error.message || "Unable to update password.");
    } finally { setPasswordSaving(false); }
  };

  return <div className="mx-auto max-w-4xl space-y-7">
    <header><p className="text-sm font-medium text-[var(--cc-primary)]">Preferences</p><h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">Settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">Choose how CampusConnect looks and manage the links shown on your profile.</p></header>

    <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="border-b border-[var(--cc-border)] p-5 sm:p-6"><h2 className="font-semibold text-[var(--cc-heading)]">Account password</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Passwords are stored as one-way hashes. Administrators cannot view or retrieve them.</p>{user?.password_reset_required && <p className="mt-3 rounded-lg bg-[var(--cc-warning-soft,var(--cc-primary-soft))] px-3 py-2 text-sm font-medium text-[var(--cc-primary)]">An administrator has asked you to choose a new password before continuing.</p>}</div>
      <form onSubmit={changePassword} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Current password</span><input required autoComplete="current-password" type="password" value={password.current_password} onChange={(event) => setPassword((current) => ({ ...current, current_password: event.target.value }))} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">New password</span><input required minLength={12} autoComplete="new-password" type="password" value={password.new_password} onChange={(event) => setPassword((current) => ({ ...current, new_password: event.target.value }))} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" /><span className="mt-1 block text-xs text-[var(--cc-text-soft)]">Use at least 12 characters.</span></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Confirm new password</span><input required minLength={12} autoComplete="new-password" type="password" value={password.confirm} onChange={(event) => setPassword((current) => ({ ...current, confirm: event.target.value }))} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" /></label>
        <div className="sm:col-span-2"><Button type="submit" loading={passwordSaving}>Update password</Button></div>
      </form>
    </section>

    {user?.permissions?.includes("profile.request_username_change") && <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="border-b border-[var(--cc-border)] p-5 sm:p-6"><h2 className="font-semibold text-[var(--cc-heading)]">Request a username change</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Usernames are permanent unless an administrator approves a change request.</p></div>
      <form onSubmit={submitUsernameRequest} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Current username</span><input readOnly value={`@${user?.username || ""}`} className="h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface-subtle)] px-3 text-sm text-[var(--cc-text-muted)]" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Requested username</span><input required minLength={3} maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9_]{2,29}" value={usernameRequest.new_username} onChange={(event) => setUsernameRequest((current) => ({ ...current, new_username: event.target.value }))} placeholder="new_username" className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" /></label>
        <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Reason for change</span><textarea required maxLength={1000} rows={3} value={usernameRequest.reason} onChange={(event) => setUsernameRequest((current) => ({ ...current, reason: event.target.value }))} placeholder="Tell us why you need to change your username." className="focus-ring w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 py-2.5 text-sm text-[var(--cc-text)]" /></label>
        <div className="sm:col-span-2"><Button type="submit" loading={usernameRequestSaving} disabled={hasPendingUsernameRequest}>{hasPendingUsernameRequest ? "Request pending review" : "Submit request"}</Button>{hasPendingUsernameRequest && <p className="mt-2 text-xs text-[var(--cc-text-muted)]">You can submit another request after an administrator reviews this one.</p>}</div>
      </form>
      {usernameRequests.length > 0 && <div className="border-t border-[var(--cc-border)] px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Recent requests</p><div className="mt-2 space-y-2">{usernameRequests.slice(0, 3).map((item) => <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--cc-bg)] px-3 py-2 text-sm"><span>@{item.old_username} → @{item.new_username}</span><span className="rounded-full bg-[var(--cc-primary-soft)] px-2.5 py-1 text-xs font-medium capitalize text-[var(--cc-primary)]">{item.status}</span></div>)}</div></div>}
    </section>}

    <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="border-b border-[var(--cc-border)] p-5 sm:p-6"><h2 className="font-semibold text-[var(--cc-heading)]">Profile links</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Add public professional links. A resume can be hosted on Google Drive or another HTTPS site.</p></div>
      <form onSubmit={saveLinks} className="space-y-5 p-5 sm:p-6">
        {LINK_FIELDS.map(({ key, label, placeholder }) => <label key={key} className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">{label}</span><input type="url" value={links[key]} onChange={(event) => setLinks((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} maxLength={500} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" /></label>)}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cc-border)] pt-4"><p className="text-xs text-[var(--cc-text-soft)]">Leave a field blank to remove that link from your profile.</p><Button type="submit" loading={saving}>Save profile links</Button></div>
      </form>
    </section>

    <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
      <div className="border-b border-[var(--cc-border)] p-5 sm:p-6"><h2 className="font-semibold text-[var(--cc-heading)]">Appearance</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Customize CampusConnect on this device.</p></div>
      <div className="flex items-center justify-between gap-4 p-5 sm:p-6"><div><p className="text-sm font-medium text-[var(--cc-text)]">Dark mode</p><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Currently using {theme === "dark" ? "dark" : "light"} mode.</p></div><Button type="button" variant="secondary" onClick={toggleTheme}>Switch to {theme === "dark" ? "light" : "dark"}</Button></div>
    </section>
  </div>;
}
