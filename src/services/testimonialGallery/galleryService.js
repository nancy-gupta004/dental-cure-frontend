import { request, authHeaders } from "../apiClient";

export const getTestimonialGallery = () =>
  request("/api/testimonial-gallery/gallery");

export const createTestimonialGalleryItem = (formData) =>
  request("/api/testimonial-gallery/gallery/items", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTestimonialGalleryItem = (id, formData) =>
  request(`/api/testimonial-gallery/gallery/items/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteTestimonialGalleryItem = (id) =>
  request(`/api/testimonial-gallery/gallery/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

export const reorderTestimonialGalleryItems = (order) =>
  request("/api/testimonial-gallery/gallery/items/reorder", {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });