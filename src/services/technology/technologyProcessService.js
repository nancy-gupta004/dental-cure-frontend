import { request, authHeaders } from "../apiClient";

export const getTechnologyProcess = () => request("/api/technology/process");

export const createProcessSection = (data) =>
  request("/api/technology/process", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateProcessSection = (data) =>
  request("/api/technology/process", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createProcessItem = (formData) =>
  request("/api/technology/process/items", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateProcessItem = (itemId, formData) =>
  request(`/api/technology/process/items/${itemId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const reorderProcessItems = (order) =>
  request("/api/technology/process/items/reorder", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ order }),
  });

export const deleteProcessItem = (itemId) =>
  request(`/api/technology/process/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });