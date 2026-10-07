import { request } from "../request";

export const eventApi = {
  getEvents: () =>
    request("/events"),

  getEvent: (identifier) =>
    request(`/events/${encodeURIComponent(identifier)}`),
};