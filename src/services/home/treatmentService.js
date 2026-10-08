import { request, authHeaders } from "../apiClient";

export const getTreatments = () => request("/api/home/treatments");

export const createSection = (data) =>
  request("/api/home/treatments", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/treatments", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createTreatment = (formData) =>
  request("/api/home/treatments/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTreatment = (treatmentId, formData) =>
  request(`/api/home/treatments/cards/${treatmentId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteTreatment = (treatmentId) =>
  request(`/api/home/treatments/cards/${treatmentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

export const reorderTreatments = (order) =>
  request("/api/home/treatments/reorder", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ order }),
  });
