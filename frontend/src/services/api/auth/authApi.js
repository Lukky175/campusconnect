import { request } from "../request";


export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () =>
    request("/auth/me"),

  checkUsername: (username) => request(`/auth/check-username?username=${encodeURIComponent(username)}`),

  changePassword: (payload) => request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
};
