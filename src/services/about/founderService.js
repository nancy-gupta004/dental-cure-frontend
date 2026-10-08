import { request, authHeaders } from "../apiClient";

export const getFounder = () => request("/api/about/founder");

export const createFounder = (formData) =>
  request("/api/about/founder", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateFounder = (formData) =>
  request("/api/about/founder", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
