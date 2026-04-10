import { PrismaClient } from "@prisma/client";

// Reutiliza una única instancia en desarrollo (hot reload) para no agotar conexiones
const globalForPrisma = globalThis;

/** Cliente Prisma singleton para API routes y server components */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
