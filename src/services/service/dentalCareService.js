import { request, authHeaders } from "../apiClient";

export const getServiceDentalCare = () => request("/api/service/dental-care");

export const createServiceDentalCare = (formData) =>
  request("/api/service/dental-care", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceDentalCare = (formData) =>
  request("/api/service/dental-care", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
