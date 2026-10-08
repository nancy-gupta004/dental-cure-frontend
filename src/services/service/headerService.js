import { request, authHeaders } from "../apiClient";

export const getServiceHeader = () => request("/api/service/header");

export const createServiceHeader = (formData) =>
  request("/api/service/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceHeader = (formData) =>
  request("/api/service/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
