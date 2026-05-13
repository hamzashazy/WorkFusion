/**
 * API base URL — set REACT_APP_API_URL in .env (e.g. https://your-api.com/api).
 * In development, falls back to local backend if unset.
 */
const envUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');

export const API_BASE_URL =
  envUrl ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '');
