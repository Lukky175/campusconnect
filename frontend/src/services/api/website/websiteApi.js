import { request } from "../request";

export const websiteApi = {
  getWebsiteSettings: () => request("/website"),
  submitContactMessage: (payload) => request("/website/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
};
