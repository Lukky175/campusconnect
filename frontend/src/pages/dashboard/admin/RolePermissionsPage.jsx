import { useEffect, useState } from "react";

import {
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";


export default function RolePermissionsPage() {
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] =
    useState([]);

  const [selectedRole, setSelectedRole] =
    useState(null);

  const [newPermission, setNewPermission] =
    useState("");

  const [newRoleName, setNewRoleName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const [
        rolesData,
        permissionsData,
      ] = await Promise.all([
        api.getRoles(),
        api.getPermissions(),
      ]);

      setRoles(
        rolesData.roles || []
      );

      setAllPermissions(
        permissionsData.permissions || []
      );

      if (
        !selectedRole &&
        rolesData.roles?.length
      ) {
        setSelectedRole(
          rolesData.roles[0]
        );
      }
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to load roles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function togglePermission(
    permission
  ) {
    if (!selectedRole) {
      return;
    }

    const exists =
      selectedRole.permissions.includes(
        permission
      );

    const permissions = exists
      ? selectedRole.permissions.filter(
          (item) =>
            item !== permission
        )
      : [
          ...selectedRole.permissions,
          permission,
        ];

    setSelectedRole({
      ...selectedRole,
      permissions,
    });
  }

  async function savePermissions() {
    if (!selectedRole) {
      return;
    }

    try {
      const data =
        await api.updatePermissions(
          selectedRole.name,
          selectedRole.permissions
        );

      setRoles((current) =>
        current.map((role) =>
          role.name ===
          selectedRole.name
            ? data.role
            : role
        )
      );

      setSelectedRole(
        data.role
      );

      toast.success(
        "Permissions updated."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to update permissions."
      );
    }
  }

  function addCustomPermission() {
    const permission =
      newPermission
        .trim()
        .toLowerCase();

    if (!permission) {
      return;
    }

    if (
      !selectedRole.permissions.includes(
        permission
      )
    ) {
      setSelectedRole({
        ...selectedRole,
        permissions: [
          ...selectedRole.permissions,
          permission,
        ],
      });
    }

    setAllPermissions((current) =>
      current.includes(permission)
        ? current
        : [...current, permission].sort()
    );

    setNewPermission("");
  }

  async function createRole() {
    const name =
      newRoleName
        .trim()
        .toLowerCase();

    if (!name) {
      return;
    }

    try {
      const data =
        await api.createRole({
          name,
          permissions: [],
        });

      setRoles((current) => [
        ...current,
        data.role,
      ]);

      setSelectedRole(
        data.role
      );

      setNewRoleName("");

      toast.success(
        "Role created."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to create role."
      );
    }
  }

  async function deleteRole() {
    if (
      !selectedRole ||
      selectedRole.is_system
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete the "${selectedRole.name}" role?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteRole(
        selectedRole.name
      );

      const remaining =
        roles.filter(
          (role) =>
            role.name !==
            selectedRole.name
        );

      setRoles(remaining);

      setSelectedRole(
        remaining[0] || null
      );

      toast.success(
        "Role deleted."
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to delete role."
      );
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--cc-text-muted)]">
        Loading roles and permissions...
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
          Roles & Permissions
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          Define what each role can do across
          CampusConnect. Changes are stored in the
          database and apply to backend authorization.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Roles */}
        <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--cc-heading)]">
              Roles
            </h2>
          </div>

          <div className="mt-4 space-y-1">
            {roles.map((role) => (
              <button
                key={role.name}
                type="button"
                onClick={() =>
                  setSelectedRole(role)
                }
                className={`w-full rounded-[var(--cc-radius-md)] px-3 py-2.5 text-left text-sm ${
                  selectedRole?.name ===
                  role.name
                    ? "bg-[var(--cc-primary-soft)] font-medium text-[var(--cc-primary)]"
                    : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
                }`}
              >
                <span className="capitalize">
                  {role.name}
                </span>

                {role.is_system && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--cc-text-soft)]">
                    system
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--cc-border)] pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
              Create role
            </p>

            <input
              value={newRoleName}
              onChange={(event) =>
                setNewRoleName(
                  event.target.value
                )
              }
              placeholder="event_manager"
              className="mt-2 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
            />

            <button
              type="button"
              onClick={createRole}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-3 py-2 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]"
            >
              <Plus className="size-4" />
              Create role
            </button>
          </div>
        </section>

        {/* Permissions */}
        <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6 shadow-[var(--cc-shadow-sm)]">
          {selectedRole ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">
                    Selected role
                  </p>

                  <h2 className="mt-1 text-xl font-semibold capitalize text-[var(--cc-heading)]">
                    {selectedRole.name}
                  </h2>
                </div>

                <div className="flex gap-2">
                  {!selectedRole.is_system && (
                    <button
                      type="button"
                      onClick={deleteRole}
                      className="flex items-center gap-2 rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] px-3 py-2 text-sm font-medium text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={savePermissions}
                    className="flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]"
                  >
                    <Save className="size-4" />
                    Save permissions
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-[var(--cc-heading)]">
                  Permissions
                </p>

                <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
                  Select what this role is allowed to do.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {allPermissions.map(
                  (permission) => {
                    const enabled =
                      selectedRole.permissions.includes(
                        permission
                      );

                    return (
                      <label
                        key={permission}
                        className={`flex cursor-pointer items-start gap-3 rounded-[var(--cc-radius-md)] border p-3 ${
                          enabled
                            ? "border-[var(--cc-primary)] bg-[var(--cc-primary-soft)]"
                            : "border-[var(--cc-border)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() =>
                            togglePermission(
                              permission
                            )
                          }
                          className="mt-0.5"
                        />

                        <span className="text-sm text-[var(--cc-text)]">
                          {permission}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              <div className="mt-8 border-t border-[var(--cc-border)] pt-6">
                <p className="text-sm font-medium text-[var(--cc-heading)]">
                  Add permission
                </p>

                <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
                  Add a new permission name without changing
                  the application code. It can then be assigned
                  to roles.
                </p>

                <div className="mt-3 flex gap-2">
                  <input
                    value={newPermission}
                    onChange={(event) =>
                      setNewPermission(
                        event.target.value
                      )
                    }
                    placeholder="reports.export"
                    className="min-w-0 flex-1 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]"
                  />

                  <button
                    type="button"
                    onClick={
                      addCustomPermission
                    }
                    className="rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] px-4 py-2 text-sm font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-sm text-[var(--cc-text-muted)]">
              Select a role to manage its permissions.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}