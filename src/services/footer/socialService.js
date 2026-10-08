import { request, authHeaders } from "../apiClient";

export const getSocials = () => request("/api/footer/socials");

export const createSocial = (formData) =>
  request("/api/footer/socials", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateSocial = (id, formData) =>
  request(`/api/footer/socials/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteSocial = (id) =>
  request(`/api/footer/socials/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

export const reorderSocials = (order) =>
  request("/api/footer/socials/reorder", {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });
