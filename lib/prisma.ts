import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

  if (!connectionString) {
    // DATABASE_URL or DIRECT_URL is required for Prisma client initialization.
    // Throwing here ensures `prisma` is always a PrismaClient and avoids
    // nullable types that cause TypeScript errors in routes that use `prisma`.
    throw new Error("DATABASE_URL or DIRECT_URL is not set");
  }

  if (connectionString.startsWith("prisma+postgres://")) {
    // Prisma Accelerate — set DATABASE_URL for the client and construct normally
    process.env.DATABASE_URL = connectionString;
    return new PrismaClient();
  } else {
    // Direct Postgres via adapter
    const pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const requirePrisma = () => {
  if (!prisma) throw new Error("Prisma client is not initialized. DATABASE_URL may not be set.");
  return prisma;
};

export const isPrismaNotFound = (error: unknown): boolean => {
  const { Prisma } = require("@prisma/client");
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return (error as any).code === "P2025";
};