/**
 * API base URL — optional REACT_APP_API_URL in .env overrides this (include /api suffix).
 * Production default: deployed backend on Vercel.
 */
const envUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');

const PRODUCTION_API_BASE = 'https://workfusion-backend.vercel.app/api';

export const API_BASE_URL =
  envUrl ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api'
    : PRODUCTION_API_BASE);
