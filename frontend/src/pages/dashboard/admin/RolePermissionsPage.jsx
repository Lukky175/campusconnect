import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { api } from "../../../services/api";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const PERMISSION_GROUPS = [
  { title: "Events", entries: [["events.view", "View events", "Browse the campus event directory and event details."], ["events.create", "Create events", "Create and publish new campus events."], ["events.edit", "Edit any event", "Update any event in the admin event manager."], ["events.edit_own", "Edit own events", "Update only events created by this account."], ["events.delete", "Delete events", "Permanently remove events from the directory."]] },
  { title: "Registrations", entries: [["registrations.create", "Register for events", "Create registrations for the signed-in account."], ["registrations.view_own", "View own registrations", "See and cancel the signed-in account’s registrations."], ["registrations.view", "View event rosters", "See registered students for an event."], ["registrations.manage", "Manage registrations", "Add students and update or cancel registration status."]] },
  { title: "Profile", entries: [["profile.view", "View profile", "Open the signed-in account profile."], ["profile.edit", "Edit profile", "Update the signed-in account profile and links."], ["profile.request_username_change", "Request username change", "Submit a reasoned request for an administrator to review."]] },
  { title: "Users & roles", entries: [["users.view", "View users", "Open the users directory."], ["users.manage", "Manage users", "Change roles and account status, or require a password change."], ["users.username.manage", "Manage usernames", "Change user handles and review username change requests."], ["roles.view", "View roles", "See roles and the available permission catalog."], ["roles.manage", "Manage roles", "Create and remove roles and assign supported permissions."]] },
  { title: "Notifications", entries: [["notifications.send", "Send notifications", "Send a notification to a selected account or role."]] },
  { title: "Website content", entries: [["clubs.manage", "Manage tech clubs", "Create, edit, order, publish, deactivate, or remove club records."], ["blogs.manage", "Manage blogs", "Create, edit, reorder, publish, and remove public blogs."], ["website.manage", "Manage website settings", "Edit FAQ questions and public contact information."]] },
  { title: "Community moderation", entries: [["feed.moderate", "Moderate the campus feed", "Review post reports and access moderation tools."]] },
];

export default function RolePermissionsPage() {
  const toast = useToast();
  const { user, refreshUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([api.getRoles(), api.getPermissions()]);
      const nextRoles = rolesData.roles || [];
      const supportedPermissions = permissionsData.permissions || [];
      setRoles(nextRoles);
      setAllPermissions(supportedPermissions);
      setSelectedRole((current) => {
        const role = nextRoles.find((item) => item.name === current?.name) || current || nextRoles[0] || null;
        return role ? { ...role, permissions: (role.permissions || []).filter((permission) => supportedPermissions.includes(permission)) } : null;
      });
    } catch (error) { toast.error(error.message || "Unable to load roles."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  function togglePermission(permission) {
    setSelectedRole((current) => {
      if (!current) return current;
      const enabled = current.permissions.includes(permission);
      return { ...current, permissions: enabled ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] };
    });
  }

  function chooseRole(role) {
    setSelectedRole({ ...role, permissions: (role.permissions || []).filter((permission) => allPermissions.includes(permission)) });
  }

  async function savePermissions() {
    if (!selectedRole) return;
    try {
      const result = await api.updatePermissions(selectedRole.name, selectedRole.permissions);
      setRoles((current) => current.map((role) => role.name === result.role.name ? result.role : role));
      setSelectedRole(result.role);
      if (result.role.name === user?.role) await refreshUser();
      toast.success("Permissions saved and applied to new requests.");
    } catch (error) { toast.error(error.message || "Unable to update permissions."); }
  }

  async function createRole() {
    const name = newRoleName.trim().toLowerCase();
    if (!name) return;
    try {
      const result = await api.createRole({ name, permissions: [] });
      setRoles((current) => [...current, result.role]);
      setSelectedRole(result.role);
      setNewRoleName("");
      toast.success("Role created.");
    } catch (error) { toast.error(error.message || "Unable to create role."); }
  }

  async function deleteRole() {
    if (!selectedRole || selectedRole.is_system || !window.confirm(`Delete the “${selectedRole.name}” role?`)) return;
    try {
      await api.deleteRole(selectedRole.name);
      const remaining = roles.filter((role) => role.name !== selectedRole.name);
      setRoles(remaining);
      setSelectedRole(remaining[0] || null);
      toast.success("Role deleted.");
    } catch (error) { toast.error(error.message || "Unable to delete role."); }
  }

  if (loading) return <div className="py-12 text-center text-sm text-[var(--cc-text-muted)]">Loading roles and permissions…</div>;

  return <div className="space-y-7">
    <header><p className="text-sm font-medium text-[var(--cc-primary)]">Administration</p><h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">Roles &amp; Permissions</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--cc-text-muted)]">Choose from permissions that are implemented in CampusConnect. Changes are stored in MongoDB and checked by the backend on each request.</p></header>
    <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
      <section className="h-fit rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)]"><h2 className="font-semibold text-[var(--cc-heading)]">Roles</h2><div className="mt-3 space-y-1">{roles.map((role) => <button key={role.name} type="button" onClick={() => chooseRole(role)} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${selectedRole?.name === role.name ? "bg-[var(--cc-primary-soft)] font-semibold text-[var(--cc-primary)]" : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"}`}><span className="capitalize">{role.name}</span>{role.is_system && <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--cc-text-soft)]">system</span>}</button>)}</div>
        <form className="mt-5 border-t border-[var(--cc-border)] pt-4" onSubmit={(event) => { event.preventDefault(); createRole(); }}><label className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]" htmlFor="new-role-name">Create role</label><input id="new-role-name" value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} placeholder="event_manager" className="focus-ring mt-2 h-10 w-full rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]"/><Button type="submit" className="mt-2 w-full"><Plus className="size-4" /> Create role</Button></form>
      </section>

      <section className="min-w-0 rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-6">
        {selectedRole ? <>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--cc-border)] pb-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-text-soft)]">Selected role</p><h2 className="mt-1 text-xl font-semibold capitalize text-[var(--cc-heading)]">{selectedRole.name}</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">{selectedRole.permissions.length} permissions enabled</p></div><div className="flex gap-2">{!selectedRole.is_system && <Button type="button" variant="ghost" onClick={deleteRole} className="border border-[var(--cc-border)] text-[var(--cc-danger)]"><Trash2 className="size-4" /> Delete role</Button>}<Button type="button" onClick={savePermissions}><Save className="size-4" /> Save permissions</Button></div></div>
          <div className="mt-5"><h3 className="font-semibold text-[var(--cc-heading)]">Permissions</h3><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Select what this role is allowed to do. Each option maps to a protected page or backend action.</p></div>
          <div className="mt-5 space-y-6">{PERMISSION_GROUPS.map((group) => {
            const entries = group.entries.filter(([permission]) => allPermissions.includes(permission));
            if (!entries.length) return null;
            return <section key={group.title}><h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cc-text-soft)]">{group.title}</h4><div className="grid gap-2 sm:grid-cols-2">{entries.map(([permission, label, description]) => {
              const checked = selectedRole.permissions.includes(permission);
              return <label key={permission} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${checked ? "border-[var(--cc-primary)] bg-[var(--cc-primary-soft)]" : "border-[var(--cc-border)] hover:bg-[var(--cc-surface-subtle)]"}`}><input type="checkbox" checked={checked} onChange={() => togglePermission(permission)} className="mt-1 accent-[var(--cc-primary)]"/><span className="min-w-0"><span className="block text-sm font-semibold text-[var(--cc-text)]">{label}</span><span className="mt-1 block text-xs leading-5 text-[var(--cc-text-muted)]">{description}</span><code className="mt-1.5 block text-[11px] text-[var(--cc-text-soft)]">{permission}</code></span></label>;
            })}</div></section>;
          })}</div>
        </> : <div className="py-14 text-center text-sm text-[var(--cc-text-muted)]">Create or select a role to manage its permissions.</div>}
      </section>
    </div>
  </div>;
}
