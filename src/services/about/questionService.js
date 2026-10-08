import { request, authHeaders } from "../apiClient";

export const getQuestion = () => request("/api/about/question");

export const createQuestion = (data) =>
  request("/api/about/question", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateQuestion = (data) =>
  request("/api/about/question", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
