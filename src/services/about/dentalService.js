import { request, authHeaders } from "../apiClient";

// A Dental section can hold at most 4 cards
export const MAX_DENTAL_CARDS = 4;

export const getDental = () => request("/api/about/dental");

export const createDental = (formData) =>
  request("/api/about/dental", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateDental = (formData) =>
  request("/api/about/dental", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const addDentalCard = (formData) =>
  request("/api/about/dental/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateDentalCard = (cardId, formData) =>
  request(`/api/about/dental/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteDentalCard = (cardId) =>
  request(`/api/about/dental/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
