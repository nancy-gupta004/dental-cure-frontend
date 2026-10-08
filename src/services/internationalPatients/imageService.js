import { request, authHeaders } from "../apiClient";

// The four image slots of the section, so the form and the API always use the
// same field names
export const IMAGE_FIELDS = ["image_1", "image_2", "image_3", "image_4"];

export const getImage = () => request("/api/international-patients/image");

export const createImage = (formData) =>
  request("/api/international-patients/image", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateImage = (formData) =>
  request("/api/international-patients/image", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });