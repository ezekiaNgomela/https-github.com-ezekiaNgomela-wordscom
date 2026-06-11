import { PrismaClient } from "@prisma/client";

/**
 * DB Client (Prisma)
 * Central database connection layer
 */

export const db = new PrismaClient();
