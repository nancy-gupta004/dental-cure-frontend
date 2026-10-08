import { request, authHeaders } from "../apiClient";

export const getTechnologyHeader = () => request("/api/technology/header");

export const createTechnologyHeader = (formData) =>
  request("/api/technology/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTechnologyHeader = (formData) =>
  request("/api/technology/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });