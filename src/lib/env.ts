export const isDev =
  process.env.NODE_ENV === "development" ||
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.MODE === "development");
