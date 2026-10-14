import { request } from "./api/request";

import { authApi } from "./api/auth/authApi";

import { eventApi } from "./api/events/eventApi";
import { eventCreateApi } from "./api/events/eventCreateApi";
import { eventEditApi } from "./api/events/eventEditApi";
import { eventDeleteApi } from "./api/events/eventDeleteApi";

import { registrationApi } from "./api/registrations/registrationApi";

import { userAdminApi } from "./api/admin/userAdminApi";
import { roleAdminApi } from "./api/admin/roleAdminApi";
import { eventAdminApi } from "./api/admin/eventAdminApi";
import { clubApi } from "./api/clubs/clubApi";
import { blogApi } from "./api/blogs/blogApi";
import { blogAdminApi } from "./api/admin/blogAdminApi";
import { websiteApi } from "./api/website/websiteApi";
import { websiteSettingsAdminApi } from "./api/admin/websiteSettingsAdminApi";

export const api = {
  health: () =>
    request("/health"),

  ...authApi,
  ...eventApi,
  ...clubApi,
  ...blogApi,
  ...blogAdminApi,
  ...websiteApi,
  ...websiteSettingsAdminApi,

  ...eventCreateApi,
  ...eventEditApi,
  ...eventDeleteApi,

  ...registrationApi,

  ...userAdminApi,
  ...roleAdminApi,

  getAdminEvents:
    eventAdminApi.getEvents,

  createAdminEvent:
    eventAdminApi.createEvent,

  updateAdminEvent:
    eventAdminApi.updateEvent,

  deleteAdminEvent:
    eventAdminApi.deleteEvent,
};
