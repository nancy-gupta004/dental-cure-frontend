import { request, authHeaders } from "../apiClient";

export const getTreatmentProcess = () => request("/api/about/treatment-process");

export const createSection = (data) =>
  request("/api/about/treatment-process", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/about/treatment-process", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createCard = (formData) =>
  request("/api/about/treatment-process/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCard = (cardId, formData) =>
  request(`/api/about/treatment-process/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCard = (cardId) =>
  request(`/api/about/treatment-process/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
