import { request, authHeaders } from "../apiClient";

export const getTestimonialVideoHeader = () =>
  request("/api/testimonial-video/header");

export const createTestimonialVideoHeader = (formData) =>
  request("/api/testimonial-video/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTestimonialVideoHeader = (formData) =>
  request("/api/testimonial-video/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });