import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    if (process.env.NODE_ENV === "production" && !process.env.TRIGGER_PROJECT_REF) {
      throw new Error("DATABASE_URL is not set");
    }
    return null;
  }

  if (connectionString.startsWith("prisma+postgres://")) {
    // Prisma Accelerate — pass URL via datasourceUrl
    return new PrismaClient({
      datasourceUrl: connectionString,
    });
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
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
};