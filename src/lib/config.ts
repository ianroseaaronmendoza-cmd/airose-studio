// src/config.ts
// Unified config for backend API URL

declare const process: {
  env: {
    REACT_APP_BACKEND_URL?: string;
    NODE_ENV?: string;
  };
};

// ✔ BACKEND BASE URL
export const API_BASE =
  (typeof process !== "undefined" &&
    process.env?.REACT_APP_BACKEND_URL &&
    process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "")) ||
  "http://localhost:4000";

// Helpers
export const IS_PRODUCTION =
  process?.env?.NODE_ENV === "production";

export const IS_DEVELOPMENT =
  process?.env?.NODE_ENV === "development";
