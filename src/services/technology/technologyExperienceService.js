import { request, authHeaders } from "../apiClient";

export const getTechnologyExperience = () => request("/api/technology/experience");

export const createTechnologyExperience = (formData) =>
  request("/api/technology/experience", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateTechnologyExperience = (formData) =>
  request("/api/technology/experience", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });