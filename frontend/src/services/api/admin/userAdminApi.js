import { request } from "../request";

export const userAdminApi = {
  getUsers: () =>
    request("/admin/users"),

  updateRole: (userId, role) =>
    request(
      `/admin/users/${encodeURIComponent(
        userId
      )}/role`,
      {
        method: "PATCH",
        body: JSON.stringify({
          role,
        }),
      }
    ),

  updateStatus: (userId, isActive) =>
    request(
      `/admin/users/${encodeURIComponent(
        userId
      )}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          is_active: isActive,
        }),
      }
    ),
};