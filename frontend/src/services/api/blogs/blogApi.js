import { request } from "../request";

export const blogApi = {
  getBlogs: () => request("/blogs"),
  getBlog: (slug) => request(`/blogs/${encodeURIComponent(slug)}`),
};
