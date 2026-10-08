import { request, authHeaders } from "../apiClient";

export const getDental = () => request("/api/home/services");

export const createSection = (data) =>
  request("/api/home/services", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/services", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createCard = (formData) =>
  request("/api/home/services/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCard = (cardId, formData) =>
  request(`/api/home/services/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCard = (cardId) =>
  request(`/api/home/services/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });