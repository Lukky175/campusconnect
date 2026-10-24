import { useEffect, useState } from "react";

import {
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
} from "lucide-react";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";


export default function UsersPage() {
  const toast = useToast();
  const { hasPermission } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usernameRequests, setUsernameRequests] = useState([]);
  const [editingUsername, setEditingUsername] = useState(null);
  const [usernameDraft, setUsernameDraft] = useState("");

  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const requestsPromise = hasPermission("users.username.manage") ? api.getUsernameChangeRequests() : Promise.resolve({ requests: [] });
      const [usersData, rolesData, requestsData] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
        requestsPromise,
      ]);

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
      setUsernameRequests(requestsData.requests || []);
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [hasPermission]);

  async function saveUsername(user) {
    try {
      const result = await api.updateUsername(user._id, usernameDraft);
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, username: result.username } : item));
      setEditingUsername(null);
      toast.success("Username updated.");
    } catch (error) { toast.error(error.message || "Unable to update username."); }
  }

  async function reviewUsernameRequest(item, status) {
    try {
      await api.reviewUsernameChangeRequest(item._id, status);
      setUsernameRequests((current) => current.filter((request) => request._id !== item._id));
      if (status === "approved") setUsers((current) => current.map((user) => user._id === item.user._id ? { ...user, username: item.new_username } : user));
      toast.success(`Username request ${status}.`);
    } catch (error) { toast.error(error.message || "Unable to review username request."); }
  }

  async function changeRole(
    userId,
    role
  ) {
    try {
      await api.updateRole(
        userId,
        role
      );

      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );

      toast.success(
        "User role updated."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to update role."
      );
    }
  }

  async function toggleStatus(user) {
    try {
      const nextStatus =
        !user.is_active;

      await api.updateStatus(
        user._id,
        nextStatus
      );

      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? {
                ...item,
                is_active: nextStatus,
              }
            : item
        )
      );

      toast.success(
        nextStatus
          ? "User activated."
          : "User deactivated."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to update user status."
      );
    }
  }

  async function requirePasswordReset(user) {
    try {
      await api.requirePasswordReset(user._id);
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, password_reset_required: true } : item));
      toast.success("Password change required at the user's next sign-in. No password was generated or exposed.");
    } catch (error) {
      toast.error(error.message || "Unable to require a password change.");
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--cc-text-muted)]">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Administration
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)]">
          Users
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-[var(--cc-text-muted)]">
          Manage user accounts, roles and account
          status.
        </p>
      </section>

      {hasPermission("users.username.manage") && <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-[var(--cc-heading)]">Username change requests</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Review the student’s reason before approving a permanent username update.</p></div><span className="rounded-full bg-[var(--cc-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--cc-primary)]">{usernameRequests.length} pending</span></div>
        {usernameRequests.length ? <div className="mt-4 divide-y divide-[var(--cc-border)]">{usernameRequests.map((item) => <div key={item._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-[var(--cc-heading)]">{item.user.name} <span className="font-normal text-[var(--cc-text-muted)]">({item.user.email})</span></p><p className="mt-1 text-sm text-[var(--cc-primary)]">@{item.old_username} → @{item.new_username}</p><p className="mt-1 text-sm leading-6 text-[var(--cc-text-muted)]">{item.reason}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => reviewUsernameRequest(item, "rejected")} className="rounded-lg border border-[var(--cc-border)] px-3 py-2 text-sm font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]">Decline</button><button type="button" onClick={() => reviewUsernameRequest(item, "approved")} className="rounded-lg bg-[var(--cc-primary)] px-3 py-2 text-sm font-semibold text-[var(--cc-on-primary)]">Approve</button></div></div>)}</div> : <p className="mt-4 rounded-lg bg-[var(--cc-bg)] p-4 text-sm text-[var(--cc-text-muted)]">No pending requests.</p>}
      </section>}

      <section className="overflow-hidden rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  User
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  College
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Role
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-[var(--cc-border)] last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[var(--cc-heading)]">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--cc-text-muted)]">
                      {user.email}
                    </p>

                    {editingUsername === user._id ? <div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-[var(--cc-primary)]">@</span><input aria-label={`Username for ${user.name}`} value={usernameDraft} onChange={(event) => setUsernameDraft(event.target.value)} maxLength={30} className="h-8 w-40 rounded-md border border-[var(--cc-border)] bg-[var(--cc-bg)] px-2 text-xs text-[var(--cc-text)]"/><button type="button" onClick={() => saveUsername(user)} className="text-xs font-semibold text-[var(--cc-primary)]">Save</button><button type="button" onClick={() => setEditingUsername(null)} className="text-xs text-[var(--cc-text-muted)]">Cancel</button></div> : <div className="mt-1 flex items-center gap-2"><span className="text-xs text-[var(--cc-primary)]">@{user.username || "unassigned"}</span>{hasPermission("users.username.manage") && <button type="button" onClick={() => { setEditingUsername(user._id); setUsernameDraft(user.username || ""); }} className="text-[11px] font-medium text-[var(--cc-text-soft)] hover:text-[var(--cc-primary)]">Edit</button>}</div>}

                    <p className="mt-1 text-xs text-[var(--cc-text-soft)]">
                      {user.enrollment_id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-[var(--cc-text-muted)]">
                    {user.college_name}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        changeRole(
                          user._id,
                          event.target.value
                        )
                      }
                      className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
                    >
                      {roles.map(
                        (role) => (
                          <option
                            key={role.name}
                            value={role.name}
                          >
                            {role.name}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.is_active
                          ? "bg-[var(--cc-success-soft)] text-[var(--cc-success)]"
                          : "bg-[var(--cc-danger-soft)] text-[var(--cc-danger)]"
                      }`}
                    >
                      {user.is_active ? (
                        <UserCheck className="size-3.5" />
                      ) : (
                        <UserX className="size-3.5" />
                      )}

                      {user.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatus(user)
                      }
                      className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] px-3 py-2 text-xs font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"
                    >
                      {user.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                    <button type="button" onClick={() => requirePasswordReset(user)} disabled={user.password_reset_required} title={user.password_reset_required ? "A password change is already required" : "Require a password change at the user's next sign-in"} className="inline-flex items-center gap-1.5 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] px-3 py-2 text-xs font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"><KeyRound className="size-3.5" />{user.password_reset_required ? "Change required" : "Reset password"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!users.length && (
          <div className="p-10 text-center text-sm text-[var(--cc-text-muted)]">
            No users found.
          </div>
        )}
      </section>
    </div>
  );
}
