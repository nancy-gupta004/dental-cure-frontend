import { request, authHeaders } from "../apiClient";

export const getFooterAddresses = () => request("/api/footer/addresses");

export const getAllFooterAddresses = () =>
  request("/api/footer/admin/addresses", { headers: authHeaders() });

export const getFooterAddress = (id) =>
  request(`/api/footer/admin/addresses/${id}`, { headers: authHeaders() });

export const createFooterAddress = (formData) =>
  request("/api/footer/admin/addresses", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateFooterAddress = (id, formData) =>
  request(`/api/footer/admin/addresses/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteFooterAddress = (id) =>
  request(`/api/footer/admin/addresses/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });