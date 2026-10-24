import { request } from "../request";

export const feedApi = {
  getFeed: ({ before, limit = 20, saved = false } = {}) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (before) query.set("before", before);
    if (saved) query.set("saved", "true");
    return request(`/feed?${query.toString()}`);
  },
  createFeedPost: (body) => request("/feed", {
    method: "POST",
    body: JSON.stringify({ body }),
  }),
  toggleFeedReaction: (postId) => request(`/feed/${encodeURIComponent(postId)}/reactions`, {
    method: "POST",
  }),
  toggleFeedSave: (postId) => request(`/feed/${encodeURIComponent(postId)}/save`, {
    method: "POST",
  }),
  reportFeedPost: (postId, payload) => request(`/feed/${encodeURIComponent(postId)}/report`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  blockFeedAuthor: (postId) => request(`/feed/${encodeURIComponent(postId)}/block`, {
    method: "POST",
  }),
  getBlockedFeedUsers: () => request("/feed/blocked-users"),
  unblockFeedUser: (userId) => request(`/feed/blocked-users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  }),
  toggleFeedCommentReaction: (commentId) => request(`/feed/comments/${encodeURIComponent(commentId)}/reactions`, {
    method: "POST",
  }),
  deleteOwnFeedComment: (commentId) => request(`/feed/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" }),
  deleteFeedPost: (postId) => request(`/feed/admin/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  }),
  deleteOwnFeedPost: (postId) => request(`/feed/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  }),
  getFeedReports: () => request("/feed/admin/reports"),
  updateFeedReport: (reportId, status) => request(`/feed/admin/reports/${encodeURIComponent(reportId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }),
  getFeedUserProfile: (userId) => request(`/feed/admin/users/${encodeURIComponent(userId)}`),
  getFeedComments: (postId) => request(`/feed/${encodeURIComponent(postId)}/comments`),
  createFeedComment: (postId, body, reply = {}) => request(`/feed/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ body, ...reply }),
  }),
};
