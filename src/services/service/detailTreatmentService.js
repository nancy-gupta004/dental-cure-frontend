import { request, authHeaders } from "../apiClient";

// The treatment section always belongs to an existing service card, so only
// the card id is sent - never a slug or a second service id.
export const getServiceDetailTreatment = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment`, {
    headers: authHeaders(),
  });

export const createServiceDetailTreatment = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceDetailTreatment = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
