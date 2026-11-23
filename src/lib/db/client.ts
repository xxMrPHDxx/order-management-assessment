import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(connectionString: string | undefined) {
  if (!connectionString) {
    throw new Error("A PostgreSQL connection string is required to create the Prisma Client.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}
