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
};