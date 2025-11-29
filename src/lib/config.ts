// src/lib/config.ts
// Runtime-safe environment helpers for the frontend.

const _hostname =
  typeof window !== "undefined" && window.location && window.location.hostname
    ? window.location.hostname
    : undefined;

// If host is localhost or 127.0.0.1 → development
export const IS_PRODUCTION =
  typeof _hostname === "string"
    ? !(_hostname === "localhost" || _hostname === "127.0.0.1")
    : true; // default to production when unknown

export const IS_DEVELOPMENT = !IS_PRODUCTION;

// API base — empty in production (static), dev uses local helper backend
export const API_BASE = IS_DEVELOPMENT ? "http://localhost:4000" : "";

// Whether runtime should show editor features (only on localhost)
export const RUNTIME_ALLOW_EDITOR =
  typeof window !== "undefined"
    ? _hostname === "localhost" || _hostname === "127.0.0.1"
    : false;

export default {
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  API_BASE,
  RUNTIME_ALLOW_EDITOR,
};
