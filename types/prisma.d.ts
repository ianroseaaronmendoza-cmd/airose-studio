import { PrismaClient, User as PrismaUser } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export type ExtendedPrismaUser = PrismaUser & {
  passwordHash?: string | null;
};
