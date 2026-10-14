import { request } from "../request";

export const websiteSettingsAdminApi = {
  getAdminWebsiteSettings: () => request("/admin/website-settings"),
  updateAdminWebsiteSettings: (payload) => request("/admin/website-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
};
