import { request, authHeaders } from "../apiClient";

export const getInternationalPatientsHeader = () =>
  request("/api/international-patients/header");

export const createInternationalPatientsHeader = (formData) =>
  request("/api/international-patients/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateInternationalPatientsHeader = (formData) =>
  request("/api/international-patients/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });