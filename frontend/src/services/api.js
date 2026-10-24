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
import { feedApi } from "./api/feed/feedApi";

const notificationApi = {
  getNotifications: () => request("/notifications"),
  markNotificationRead: (notificationId) => request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/notifications/read-all", { method: "PATCH" }),
  sendNotification: (payload) => request("/notifications/send", { method: "POST", body: JSON.stringify(payload) }),
  createUsernameChangeRequest: (payload) => request("/profile/username-requests", { method: "POST", body: JSON.stringify(payload) }),
  getMyUsernameChangeRequests: () => request("/profile/username-requests/me"),
};

export const api = {
  health: () =>
    request("/health"),

  getMyProfile: () => request("/profile"),
  getCommunityProfile: (userId) => request(`/profile/users/${encodeURIComponent(userId)}`),
  updateMyProfile: (payload) => request("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),

  ...authApi,
  ...eventApi,
  ...clubApi,
  ...blogApi,
  ...blogAdminApi,
  ...websiteApi,
  ...websiteSettingsAdminApi,
  ...feedApi,
  ...notificationApi,

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

  getEventRegistrations: eventAdminApi.getEventRegistrations,
  addEventRegistration: eventAdminApi.addEventRegistration,
  updateEventRegistration: eventAdminApi.updateEventRegistration,
  removeEventRegistration: eventAdminApi.removeEventRegistration,
};
