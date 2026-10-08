import { request, authHeaders } from "../apiClient";

export const getTechnologyBenefit = () => request("/api/technology/benefit");

export const createBenefitSection = (formData) =>
  request("/api/technology/benefit", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateBenefitSection = (formData) =>
  request("/api/technology/benefit", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const createBenefitCard = (data) =>
  request("/api/technology/benefit/cards", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateBenefitCard = (cardId, data) =>
  request(`/api/technology/benefit/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const reorderBenefitCards = (order) =>
  request("/api/technology/benefit/cards/reorder", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ order }),
  });

export const deleteBenefitCard = (cardId) =>
  request(`/api/technology/benefit/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });