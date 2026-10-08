import { request, authHeaders } from "../apiClient";

export const getNeedHelp = () => request("/api/home/need-help");

export const createNeedHelp = (formData) =>
  request("/api/home/need-help", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateNeedHelp = (formData) =>
  request("/api/home/need-help", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });