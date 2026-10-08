import { request, authHeaders } from "../apiClient";

export const getServiceDental = () => request("/api/service/dental");

export const createSection = (data) =>
  request("/api/service/dental", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/service/dental", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createCard = (formData) =>
  request("/api/service/dental/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCard = (cardId, formData) =>
  request(`/api/service/dental/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCard = (cardId) =>
  request(`/api/service/dental/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
