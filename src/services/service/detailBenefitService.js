import { request, authHeaders } from "../apiClient";

// The benefits section always belongs to an existing service card, so only the
// card id is sent - never a slug or a second service id.
export const getServiceDetailBenefit = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/benefits`, {
    headers: authHeaders(),
  });

export const createServiceDetailBenefit = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/benefits`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateServiceDetailBenefit = (serviceCardId, formData) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/benefits`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
