import { request, authHeaders } from "../apiClient";

export const getCertificates = () => request("/api/home/certificates");

export const createSection = (data) =>
  request("/api/home/certificates", {
    method: "POST",
    headers: authHeaders(),
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/certificates", {
    method: "PUT",
    headers: authHeaders(),
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

export const createCertificate = (formData) =>
  request("/api/home/certificates/items", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateCertificate = (certificateId, formData) =>
  request(`/api/home/certificates/items/${certificateId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteCertificate = (certificateId) =>
  request(`/api/home/certificates/items/${certificateId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });