import { useEffect, useState } from "react";

import {
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";


export default function UsersPage() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const [
        usersData,
        rolesData,
      ] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
      ]);

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
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
  }, []);

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