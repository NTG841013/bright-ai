import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // DATABASE_URL is required for Prisma client initialization during build
    // Throwing here ensures `prisma` is always a PrismaClient and avoids
    // nullable types that cause TypeScript errors in routes that use `prisma`.
    throw new Error("DATABASE_URL is not set");
  }

  if (connectionString.startsWith("prisma+postgres://")) {
    // Prisma Accelerate
    return new PrismaClient();
  } else {
    // Direct Postgres with adapter
    const pool = new pg.Pool({ 
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
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
