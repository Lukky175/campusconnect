import { request } from "../request";

export const roleAdminApi = {
  getRoles: () =>
    request("/admin/roles"),

  getPermissions: () =>
    request("/admin/roles/permissions"),

  createRole: (payload) =>
    request("/admin/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePermissions: (
    roleName,
    permissions
  ) =>
    request(
      `/admin/roles/${encodeURIComponent(
        roleName
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          permissions,
        }),
      }
    ),

  deleteRole: (roleName) =>
    request(
      `/admin/roles/${encodeURIComponent(
        roleName
      )}`,
      {
        method: "DELETE",
      }
    ),
};