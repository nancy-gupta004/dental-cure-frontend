import { request, authHeaders } from "../apiClient";

export const getGallery = () => request("/api/about/gallery");

export const createSection = (formData) =>
  request("/api/about/gallery", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateSection = (formData) =>
  request("/api/about/gallery", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
