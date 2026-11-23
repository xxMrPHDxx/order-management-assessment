import "server-only";

import { env } from "@/lib/env";
import { createPrismaClient } from "@/lib/db/client";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
