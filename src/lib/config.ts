// src/lib/config.ts
/**
 * Runtime-safe environment helpers for the frontend.
 *
 * - No build-time `process` dependency.
 * - Editor mode / production detection is done at runtime
 *   using `window.location.hostname` where available.
 *
 * This file is safe to import in SSR/build-time contexts because
 * it guards access to `window`.
 */

// Client runtime detection (safe guard for build-time)
const _hostname =
  typeof window !== "undefined" && window.location && window.location.hostname
    ? window.location.hostname
    : undefined;

// Consider production when running on a real host (not localhost/127.0.0.1)
export const IS_PRODUCTION =
  typeof _hostname === "string"
    ? !(_hostname === "localhost" || _hostname === "127.0.0.1")
    : true; // default to production when hostname is unknown (build-time)

// Development if explicitly localhost
export const IS_DEVELOPMENT = !IS_PRODUCTION;

// API base: empty for static JSON-only frontend
export const API_BASE = "";

// Helper: whether editor features should be available (runtime)
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
