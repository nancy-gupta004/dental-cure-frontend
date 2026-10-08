import { request, authHeaders } from "../apiClient";

export const getPromise = () => request("/api/about/promise");

export const createPromise = (formData) =>
  request("/api/about/promise", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updatePromise = (formData) =>
  request("/api/about/promise", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const addPromiseCard = (formData) =>
  request("/api/about/promise/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updatePromiseCard = (cardId, formData) =>
  request(`/api/about/promise/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deletePromiseCard = (cardId) =>
  request(`/api/about/promise/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
