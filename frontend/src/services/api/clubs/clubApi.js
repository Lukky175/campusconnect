import { request } from "../request";

export const clubApi = {
  getClubs: () => request("/clubs"),
  getClubDetails: () => request("/clubs/details"),
};
