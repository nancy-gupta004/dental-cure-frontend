import {
  getToken,
  getRefreshToken,
  updateAccessToken,
  clearAuth,
} from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

const makeUrl = (path) => `${API_URL}${path}`;

// Access tokens expire after 15 minutes. A request that carries the stored
// token should not wait for a wasted 401 first: decode the JWT and refresh
// before sending whenever the token is already expired or about to expire.
const parseJwtExp = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const tokenReady = (token) => {
  if (!token) return false;
  const exp = parseJwtExp(token);
  if (exp === null) return false;
  // Keep a small safety margin so the trip to the server cannot expire it
  return exp > Math.floor(Date.now() / 1000) + 30;
};

const request = async (path, options = {}, retry = true) => {
  // Refresh an expired/near-expiry token before sending, so a protected
  // request never returns 401 just because the stored token is stale.
  await ensureFreshAccessToken();

  // Protected requests already carry an Authorization header, but it may have
  // been built with the old token - always sync it with the current one.
  const headers = new Headers(options.headers || {});
  if (headers.has("Authorization") && getToken()) {
    headers.set("Authorization", `Bearer ${getToken()}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(makeUrl(path), { ...options, headers });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }

  const data = await response.json().catch(() => ({}));

  // Access token expired during the trip - refresh once, then retry
  if (response.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${getToken()}`);
      return request(path, { ...options, headers: retryHeaders }, false);
    }
    clearAuth();
    throw new Error(data.message || "Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// Headers used to attach the access token to protected requests
const authHeaders = (extra = {}) => ({
  ...extra,
  Authorization: `Bearer ${getToken()}`,
});

// Refresh the access token before any protected request when it is expired or
// about to expire, so the request itself never returns 401.
const ensureFreshAccessToken = async () => {
  if (tokenReady(getToken())) {
    return true;
  }
  if (!getRefreshToken()) {
    return false;
  }
  return tryRefresh();
};

// Exchange the refresh token for a fresh access token. Concurrent calls
// (e.g. several protected requests firing at once) share the same refresh
// instead of each triggering its own round trip.
let refreshPromise = null;
const tryRefresh = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);

  if (!refreshPromise) {
    refreshPromise = fetch(makeUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.accessToken) return false;
        updateAccessToken(data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export { request, authHeaders };