import { request } from "../request";

export const eventDeleteApi = {
  deleteEvent: (eventId) =>
    request(`/admin/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
    }),
};