// src/lib/config.ts

// =======================================
// Detect environment
// =======================================

// Webpack injects NODE_ENV automatically
const NODE_ENV =
  typeof process !== "undefined" && process.env.NODE_ENV
    ? process.env.NODE_ENV
    : "development";

// =======================================
// Backend API Base URL
// =======================================

/*
  IMPORTANT:
  - In DEV: Webpack devServer proxy redirects "/api" → http://localhost:4000
  - In PROD: Fly.io serves your backend on port 8080
*/

export const API_BASE =
  NODE_ENV === "production"
    ? ""           // ✔ Production → use relative "/api"
    : "http://localhost:4000"; // ✔ Dev mode → use local API

// =======================================
// Optional helpers
// =======================================

export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = !IS_PRODUCTION;
