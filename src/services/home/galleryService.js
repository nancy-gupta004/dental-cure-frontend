import { request, authHeaders } from "../apiClient";

export const getGallery = () => request("/api/home/gallery");

export const createGallery = (formData) =>
  request("/api/home/gallery", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateGallery = (formData) =>
  request("/api/home/gallery", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
