import { request, authHeaders } from "../apiClient";

export const getFooterQuickLinks = () => request("/api/footer/quick-links");

export const saveFooterQuickLinks = (payload) =>
  request("/api/footer/quick-links", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const reorderFooterQuickLinks = (order) =>
  request("/api/footer/quick-links/reorder", {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

export const createFooterQuickLink = (payload) =>
  request("/api/footer/quick-links/items", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateFooterQuickLink = (id, payload) =>
  request(`/api/footer/quick-links/items/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteFooterQuickLink = (id) =>
  request(`/api/footer/quick-links/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });