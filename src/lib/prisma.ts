import { PrismaClient } from "@prisma/client";

// Prevent creating a new PrismaClient on every hot-reload in development,
// and reuse a single connection across serverless invocations where possible.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
