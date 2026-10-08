import { request, authHeaders } from "../apiClient";

export const getFooterServices = () => request("/api/footer/services");

export const saveFooterServices = (payload) =>
  request("/api/footer/services", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const reorderFooterServices = (order) =>
  request("/api/footer/services/reorder", {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

export const createFooterServiceItem = (payload) =>
  request("/api/footer/services/items", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateFooterServiceItem = (id, payload) =>
  request(`/api/footer/services/items/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const deleteFooterServiceItem = (id) =>
  request(`/api/footer/services/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
