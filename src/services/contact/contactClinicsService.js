import { request, authHeaders } from "../apiClient";

export const getClinics = () => request("/api/contact/clinics");

export const getClinicCards = () => request("/api/contact/clinics/cards");

export const createClinics = (data) =>
  request("/api/contact/clinics", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateClinics = (data) =>
  request("/api/contact/clinics", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createClinicCard = (formData) =>
  request("/api/contact/clinics/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateClinicCard = (cardId, formData) =>
  request(`/api/contact/clinics/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteClinicCard = (cardId) =>
  request(`/api/contact/clinics/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
