import { request } from "../request";

export const eventEditApi = {
  updateEvent: (eventId, payload) =>
    request(`/admin/events/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};