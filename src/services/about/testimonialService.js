import { request, authHeaders } from "../apiClient";

export const getTestimonial = () => request("/api/about/testimonial");

export const createSection = (data) =>
  request("/api/about/testimonial", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/about/testimonial", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createCard = (formData) =>
  request("/api/about/testimonial/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCard = (cardId, formData) =>
  request(`/api/about/testimonial/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCard = (cardId) =>
  request(`/api/about/testimonial/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
