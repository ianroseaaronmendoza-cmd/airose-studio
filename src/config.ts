// src/config.ts
// CRA-safe config file that avoids runtime "process is not defined" errors.

declare const process: {
  env: {
    REACT_APP_BACKEND_URL?: string;
    NODE_ENV?: string;
  };
};

// ✅ Backend API base URL
// Webpack replaces process.env.REACT_APP_BACKEND_URL at build time with a string literal
export const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_BACKEND_URL) ||
  "http://localhost:4000";

// ✅ Environment mode helpers
export const IS_PRODUCTION =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "production";

export const IS_DEVELOPMENT =
  typeof process !== "undefined" &&
  process.env &&
  process.env.NODE_ENV === "development";