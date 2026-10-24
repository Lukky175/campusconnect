import { request } from "../request";

export const eventAdminApi = {
  getEvents: () =>
    request("/admin/events"),

  createEvent: (payload) =>
    request("/admin/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateEvent: (eventId, payload) =>
    request(
      `/admin/events/${encodeURIComponent(
        eventId
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    ),

  deleteEvent: (eventId) =>
    request(
      `/admin/events/${encodeURIComponent(
        eventId
      )}`,
      {
        method: "DELETE",
      }
    ),

  getEventRegistrations: (eventId) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/registrations`),

  addEventRegistration: (eventId, email) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/registrations`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  updateEventRegistration: (eventId, registrationId, status) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  removeEventRegistration: (eventId, registrationId) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}`, {
      method: "DELETE",
    }),
};
