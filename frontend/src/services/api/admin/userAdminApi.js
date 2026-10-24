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

  requirePasswordReset: (userId) =>
    request(`/admin/users/${encodeURIComponent(userId)}/reset-password`, { method: "POST" }),
  updateUsername: (userId, username) => request(`/admin/users/${encodeURIComponent(userId)}/username`, { method: "PATCH", body: JSON.stringify({ username }) }),
  getUsernameChangeRequests: () => request("/admin/users/username-requests"),
  reviewUsernameChangeRequest: (requestId, status) => request(`/admin/users/username-requests/${encodeURIComponent(requestId)}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
