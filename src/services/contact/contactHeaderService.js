import { request, authHeaders } from "../apiClient";

export const getContactHeader = () => request("/api/contact/header");

export const createContactHeader = (formData) =>
  request("/api/contact/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateContactHeader = (formData) =>
  request("/api/contact/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
