import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

const databaseUrl = process.env.NODE_ENV === "test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL;

if (!process.env.DATABASE_URL_TEST && process.env.NODE_ENV === "test") {
  throw new Error("Cannot run tests without DATABASE_URL_TEST environment variable");
} else if (process.env.DATABASE_URL_TEST && process.env.DATABASE_URL_TEST === process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_TEST and DATABASE_URL cannot be the same");
}
// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ["error"],
    errorFormat: "minimal",
  });
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      datasourceUrl: databaseUrl,
      log: undefined,
    });
  }
  prisma = global.__db;
}

// Handle connection errors gracefully
prisma.$connect().catch((err) => {
  console.error("Failed to connect to database:", err);
  process.exit(1);
});

export { prisma };
