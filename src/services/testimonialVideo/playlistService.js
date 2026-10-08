import { request, authHeaders } from "../apiClient";

export const getPlaylistVideos = () =>
  request("/api/testimonial-video/playlist");

export const getAllPlaylistVideos = () =>
  request("/api/testimonial-video/admin/playlist", {
    headers: authHeaders(),
  });

export const getPlaylistVideo = (id) =>
  request(`/api/testimonial-video/admin/playlist/${id}`, {
    headers: authHeaders(),
  });

export const createPlaylistVideo = (formData) =>
  request("/api/testimonial-video/playlist/videos", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updatePlaylistVideo = (id, formData) =>
  request(`/api/testimonial-video/playlist/videos/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

export const deletePlaylistVideo = (id) =>
  request(`/api/testimonial-video/playlist/videos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

export const reorderPlaylistVideos = (order) =>
  request("/api/testimonial-video/playlist/videos/reorder", {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

export const incrementVideoViews = (id) =>
  request(`/api/testimonial-video/playlist/videos/${id}/views`, {
    method: "POST",
  });