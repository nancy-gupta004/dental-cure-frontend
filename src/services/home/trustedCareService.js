import { request, authHeaders } from "../apiClient";

export const getTrustedCare = () => request("/api/home/trusted-care");

// Used on the first save when no record exists yet
export const createTrustedCare = (formData) =>
  request("/api/home/trusted-care", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

// Used for every save after the section has been created
export const updateTrustedCare = (formData) =>
  request("/api/home/trusted-care", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });