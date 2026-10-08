export const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url || "");

// Full URLs (e.g. Cloudinary) are used as-is; relative paths (legacy local
// uploads) are prefixed with the API origin.
export const resolveMediaUrl = (url) =>
  url && isAbsoluteUrl(url) ? url : `${import.meta.env.VITE_API_URL}${url}`;