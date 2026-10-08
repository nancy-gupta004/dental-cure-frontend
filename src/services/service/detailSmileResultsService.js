import { request, authHeaders } from "../apiClient";

// The smile results section always belongs to an existing service card, so only
// the card id is sent - never a slug or a second service id.
export const getServiceDetailSmileResults = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/smile-results`, {
    headers: authHeaders(),
  });

export const createServiceDetailSmileResults = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/smile-results`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateServiceDetailSmileResults = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/smile-results`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

// The display order is assigned by the backend, so it is never sent from here
export const createSmileResultItem = (smileResultsId, formData) =>
  request(`/api/services/dental/detail/smile-results/${smileResultsId}/items`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateSmileResultItem = (itemId, formData) =>
  request(`/api/services/dental/detail/smile-results/items/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteSmileResultItem = (itemId) =>
  request(`/api/services/dental/detail/smile-results/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
