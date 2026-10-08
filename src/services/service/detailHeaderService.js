import { request, authHeaders } from "../apiClient";

export const getServiceDetailHeader = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/header`, {
    headers: authHeaders(),
  });

export const createServiceDetailHeader = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/header`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceDetailHeader = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/header`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const getServiceDetailBySlug = (slug) =>
  request(`/api/services/dental/detail/${slug}`);
