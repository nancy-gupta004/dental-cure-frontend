import { request, authHeaders } from "../apiClient";

// The treatment process section always belongs to an existing service card, so
// only the card id is sent - never a slug or a second service id.
export const getServiceDetailTreatmentProcess = (serviceCardId) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment-process`, {
    headers: authHeaders(),
  });

export const createServiceDetailTreatmentProcess = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment-process`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateServiceDetailTreatmentProcess = (serviceCardId, data) =>
  request(`/api/services/dental/cards/${serviceCardId}/detail/treatment-process`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

// The process number is assigned by the backend, so it is never sent from here
export const createTreatmentProcessCard = (treatmentProcessId, formData) =>
  request(`/api/services/dental/detail/treatment-process/${treatmentProcessId}/cards`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTreatmentProcessCard = (cardId, formData) =>
  request(`/api/services/dental/detail/treatment-process/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteTreatmentProcessCard = (cardId) =>
  request(`/api/services/dental/detail/treatment-process/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
