
import { request } from "../request";

export const registrationApi = {
  registerForEvent: (eventId) =>
    request(`/events/${encodeURIComponent(eventId)}/register`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  getMyRegistrations: () =>
    request("/registrations/me"),

  cancelRegistration: (registrationId) =>
    request(
      `/registrations/${encodeURIComponent(registrationId)}`,
      {
        method: "DELETE",
      }
    ),
};
