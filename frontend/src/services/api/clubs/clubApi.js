import { request } from "../request";

export const clubApi = {
  getClubs: () => request("/clubs"),
  getClubDetails: () => request("/clubs/details"),
  getAdminClubs: () => request("/clubs/admin"),
  createClub: (payload) => request("/clubs/admin", { method: "POST", body: JSON.stringify(payload) }),
  updateClub: (clubId, payload) => request(`/clubs/admin/${encodeURIComponent(clubId)}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteClub: (clubId) => request(`/clubs/admin/${encodeURIComponent(clubId)}`, { method: "DELETE" }),
};
