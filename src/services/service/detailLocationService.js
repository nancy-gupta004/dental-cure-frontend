import { request, authHeaders } from "../apiClient";

// The location section always belongs to an existing service card, so only the
// card id is sent - never a slug or a second service id. The public page reads
// the same section from the shared slug endpoint of the detail page.
export const getServiceDetailLocation = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/location`, {
    headers: authHeaders(),
  });

export const createServiceDetailLocation = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/location`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateServiceDetailLocation = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/location`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

// The display order is assigned by the backend, so it is never sent from here.
// Only "heading", "description" and the optional "image" file are sent.
export const createLocationCard = (locationId, formData) =>
  request(`/api/services/dental/detail/location/${locationId}/cards`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateLocationCard = (cardId, formData) =>
  request(`/api/services/dental/detail/location/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteLocationCard = (cardId) =>
  request(`/api/services/dental/detail/location/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
