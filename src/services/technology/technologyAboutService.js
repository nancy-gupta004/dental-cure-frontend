import { request, authHeaders } from "../apiClient";

export const getTechnologyAbout = () => request("/api/technology/about");

export const createTechnologyAbout = (formData) =>
  request("/api/technology/about", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTechnologyAbout = (formData) =>
  request("/api/technology/about", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });