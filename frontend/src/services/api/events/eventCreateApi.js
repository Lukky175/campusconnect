import { request } from "../request";

export const eventCreateApi = {
  createEvent: (payload) =>
    request("/admin/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};