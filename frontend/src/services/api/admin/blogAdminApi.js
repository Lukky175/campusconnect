import { request } from "../request";

export const blogAdminApi = {
  getAdminBlogs: () => request("/admin/blogs"),
  createBlog: (payload = {}) => request("/admin/blogs", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateBlog: (blogId, payload) => request(`/admin/blogs/${encodeURIComponent(blogId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  deleteBlog: (blogId) => request(`/admin/blogs/${encodeURIComponent(blogId)}`, {
    method: "DELETE",
  }),
  reorderBlogs: (blogIds) => request("/admin/blogs/order", {
    method: "PATCH",
    body: JSON.stringify({ blog_ids: blogIds }),
  }),
};
