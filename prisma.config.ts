import "dotenv/config";
import type { PrismaConfig } from "prisma";

console.log(process.env.DATABASE_URL);

export default {
  schema: "prisma/schema.prisma",
} satisfies PrismaConfig;
