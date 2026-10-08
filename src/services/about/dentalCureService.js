import { request, authHeaders } from "../apiClient";

export const getDentalCure = () => request("/api/about/dental-cure");

export const createDentalCure = (formData) =>
  request("/api/about/dental-cure", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateDentalCure = (formData) =>
  request("/api/about/dental-cure", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
