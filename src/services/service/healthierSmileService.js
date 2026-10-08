import { request, authHeaders } from "../apiClient";

export const getServiceHealthierSmile = () =>
  request("/api/services/healthier-smile");

export const createServiceHealthierSmile = (formData) =>
  request("/api/services/healthier-smile", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceHealthierSmile = (formData) =>
  request("/api/services/healthier-smile", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
