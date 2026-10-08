import { request, authHeaders } from "../apiClient";

export const getDental = () => request("/api/international-patients/dental");

export const createDental = (data) =>
  request("/api/international-patients/dental", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateDental = (data) =>
  request("/api/international-patients/dental", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });