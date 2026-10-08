import { request, authHeaders } from "../apiClient";

export const getContact = () => request("/api/home/contact");

export const createContact = (formData) =>
  request("/api/home/contact", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

export const updateContact = (formData) =>
  request("/api/home/contact", {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });

// The single Contact Enquiry list. Every enquiry form on the site writes to the
// same table, so this returns the submissions from all pages together. Passing
// a source narrows the list down to one page or section.
export const getContactEnquiries = (source) =>
  request(
    source ? `/api/contact/enquiries?source=${encodeURIComponent(source)}` : "/api/contact/enquiries",
    { headers: authHeaders() }
  );

// Public submit used by an enquiry form on any page. The form passes its own
// source so the admin list can show where the submission came from.
export const submitContactEnquiry = (data) =>
  request("/api/contact/enquiry", {
    method: "POST",
    body: JSON.stringify(data),
  });