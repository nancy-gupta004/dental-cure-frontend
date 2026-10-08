import { request, authHeaders } from "../apiClient";

export const getBeforeAfter = () => request("/api/home/before-after");

export const createBeforeAfter = (formData) =>
  request("/api/home/before-after", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateBeforeAfter = (formData) =>
  request("/api/home/before-after", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });