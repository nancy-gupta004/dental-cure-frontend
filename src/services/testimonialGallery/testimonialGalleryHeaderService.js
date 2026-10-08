import { request, authHeaders } from "../apiClient";

export const getTestimonialGalleryHeader = () =>
  request("/api/testimonial-gallery/header");

export const createTestimonialGalleryHeader = (formData) =>
  request("/api/testimonial-gallery/header", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTestimonialGalleryHeader = (formData) =>
  request("/api/testimonial-gallery/header", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });