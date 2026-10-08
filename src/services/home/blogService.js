import { request, authHeaders } from "../apiClient";

export const getBlog = () => request("/api/home/blog");

export const createSection = (data) =>
  request("/api/home/blog", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/blog", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createBlog = (formData) =>
  request("/api/home/blog/items", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateBlog = (blogId, formData) =>
  request(`/api/home/blog/items/${blogId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteBlog = (blogId) =>
  request(`/api/home/blog/items/${blogId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });