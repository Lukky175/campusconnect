import { request } from "../request";

export const registrationApi = {
  registerForEvent: (eventId, payload = {}) =>
    request(`/events/${encodeURIComponent(eventId)}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyRegistrations: () =>
    request("/registrations/me"),
};