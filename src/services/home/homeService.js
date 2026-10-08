import { request, authHeaders } from "../apiClient";

export const getHomeHeader = () => request("/api/home/header");

export const createHomeHeader = (formData) =>
  request("/api/home/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateHomeHeader = (formData) =>
  request("/api/home/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteHomeHeader = () =>
  request("/api/home/header", {
    method: "DELETE",
    headers: authHeaders(),
  });