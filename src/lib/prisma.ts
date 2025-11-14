import { PrismaClient } from "@prisma/client";

/**
 * Create a single Prisma client instance.
 * Keep global caching for hot-reloads (dev) to avoid exhausting connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    // optional: log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
