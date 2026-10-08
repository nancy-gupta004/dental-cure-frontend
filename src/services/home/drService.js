import { request, authHeaders } from "../apiClient";

export const getDr = () => request("/api/home/dr");

export const createDr = (formData) =>
  request("/api/home/dr", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateDr = (formData) =>
  request("/api/home/dr", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
