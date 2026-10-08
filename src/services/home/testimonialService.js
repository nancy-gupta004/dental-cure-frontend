import { request, authHeaders } from "../apiClient";

export const getTestimonials = () => request("/api/home/testimonials");

export const createSection = (data) =>
  request("/api/home/testimonials", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/testimonials", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createCard = (formData) =>
  request("/api/home/testimonials/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCard = (cardId, formData) =>
  request(`/api/home/testimonials/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCard = (cardId) =>
  request(`/api/home/testimonials/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });