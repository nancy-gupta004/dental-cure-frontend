import { request, authHeaders } from "../apiClient";

export const getBenefit = () => request("/api/testimonial-video/benefit");

export const createBenefit = (formData) =>
  request("/api/testimonial-video/benefit", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateBenefit = (formData) =>
  request("/api/testimonial-video/benefit", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
