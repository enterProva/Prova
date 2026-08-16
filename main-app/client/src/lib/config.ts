/**
 * Environment configuration for API endpoints
 * Vite automatically replaces import.meta.env.VITE_* variables at build time
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  linkChecks: `${API_BASE_URL}/link-checks`,
  feed: `${API_BASE_URL}/feed`,
  nudges: `${API_BASE_URL}/nudges`,
  user: `${API_BASE_URL}/user`,
} as const;

export const isProduction = import.meta.env.PROD;
