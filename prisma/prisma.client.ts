import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasourceUrl: process.env.NEXT_PUBLIC_DATABASE_URL,
});
