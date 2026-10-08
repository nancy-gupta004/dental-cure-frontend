import { request, authHeaders } from "../apiClient";

export const getFooterSetting = () => request("/api/footer/setting");

export const createFooterSetting = (formData) =>
  request("/api/footer/setting", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateFooterSetting = (formData) =>
  request("/api/footer/setting", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export * from "./socialService";
export * from "./serviceItemService";