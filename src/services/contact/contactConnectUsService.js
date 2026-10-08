import { request, authHeaders } from "../apiClient";

export const getContactConnectUs = () => request("/api/contact/connect-us");

export const createConnectUs = (data) =>
  request("/api/contact/connect-us", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateConnectUs = (data) =>
  request("/api/contact/connect-us", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createConnectUsCard = (formData) =>
  request("/api/contact/connect-us/cards", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateConnectUsCard = (cardId, formData) =>
  request(`/api/contact/connect-us/cards/${cardId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteConnectUsCard = (cardId) =>
  request(`/api/contact/connect-us/cards/${cardId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
