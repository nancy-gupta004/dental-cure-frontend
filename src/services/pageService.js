import { request, authHeaders } from "./apiClient";

export const fetchPage = (page) =>
  request(`/api/pages/${page}`, { headers: authHeaders() });