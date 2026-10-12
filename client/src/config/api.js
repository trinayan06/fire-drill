/**
 * Centralized Fire Drill API Client Configuration
 * 
 * - Handles development (localhost / Vite proxy) and production (Render / Netlify).
 * - Guarantees safe responses and prevents HTML doctype JSON parse errors.
 * - Prevents duplicate `/api` prefix and strips trailing slashes.
 */

const PRODUCTION_API_URL = 'https://fire-drill-api.onrender.com';

/**
 * Resolves the active API base URL.
 * In dev: returns '' to use Vite dev server proxy (/api -> http://localhost:3001)
 * In prod: uses VITE_API_URL or defaults to the live Render backend
 */
export function getApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // Detect local development environment
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]'
  );

  if (import.meta.env.DEV || isLocalhost) {
    return '';
  }

  // Production fallback to live Render backend
  return PRODUCTION_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Builds a safe, canonical API endpoint URL.
 */
export function getApiUrl(endpoint) {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api')) {
    return `${base.slice(0, -4)}${cleanEndpoint}`;
  }

  return `${base}${cleanEndpoint}`;
}

/**
 * Defensive fetch wrapper for Fire Drill API.
 * 
 * - Verifies HTTP status and Content-Type before attempting JSON parsing.
 * - Catches non-JSON / HTML responses (such as SPA 404 redirects or proxy error pages).
 * - Formats informative error messages for the UI.
 * - Never leaks secrets or API keys.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (networkErr) {
    console.error('[Fire Drill API Network Error]:', networkErr.message || networkErr);
    throw new Error(
      'Unable to connect to the Fire Drill backend. Check your network connection, API URL, and CORS settings.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  // Handle HTML or unexpected non-JSON payloads (e.g. Netlify fallback or Render startup page)
  if (!isJson) {
    console.warn(`[Fire Drill API] Non-JSON response received from ${url} (Status: ${response.status}, Content-Type: ${contentType})`);

    if (response.status === 404) {
      throw new Error('API endpoint not found (HTTP 404). Check backend route configuration.');
    }
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      throw new Error(
        'Fire Drill backend on Render is currently starting up or temporarily unavailable. Please retry in ~30 seconds.'
      );
    }
    if (response.status >= 500) {
      throw new Error('Fire Drill backend encountered an internal server error (HTTP 500).');
    }

    throw new Error(
      'Unable to reach the Fire Drill API. Please check the backend deployment and API configuration.'
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (parseErr) {
    console.error('[Fire Drill API] JSON Parse Error:', parseErr);
    throw new Error('Received malformed JSON from Fire Drill backend.');
  }

  if (!response.ok) {
    const serverMessage = data?.error || data?.message;
    if (serverMessage) {
      throw new Error(serverMessage);
    }
    if (response.status === 404) {
      throw new Error('API endpoint not found (HTTP 404). Check backend route configuration.');
    }
    if (response.status >= 500) {
      throw new Error('Fire Drill backend encountered an internal server error (HTTP 500).');
    }
    throw new Error(`API request failed with HTTP status ${response.status}.`);
  }

  return data;
}
