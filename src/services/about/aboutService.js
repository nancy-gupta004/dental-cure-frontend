import { request, authHeaders } from "../apiClient";

export const getAbout = () => request("/api/about");

export const createAbout = (formData) =>
  request("/api/about", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateAbout = (formData) =>
  request("/api/about", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });