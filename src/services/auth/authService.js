import { request, authHeaders } from "../apiClient";

export const login = ({ email, password }) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const fetchMe = () =>
  request("/api/auth/me", { headers: authHeaders() });

export const logout = (refreshToken) =>
  request("/api/auth/logout", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ refreshToken }),
  });

export const createUser = (payload) =>
  request("/api/users", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });