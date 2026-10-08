import { request, authHeaders } from "../apiClient";

export const getTeams = () => request("/api/home/team");

export const createSection = (data) =>
  request("/api/home/team", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const updateSection = (data) =>
  request("/api/home/team", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

export const createMember = (formData) =>
  request("/api/home/team/members", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateMember = (memberId, formData) =>
  request(`/api/home/team/members/${memberId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deleteMember = (memberId) =>
  request(`/api/home/team/members/${memberId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });