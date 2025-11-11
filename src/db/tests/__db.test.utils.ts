import { Database } from "@/db";

const DatabaseOrms = [
  { orm: "prisma", tests: false },
  // { orm: "mock", tests: true },
] as const;
type DatabaseOrm = (typeof DatabaseOrms)[number]["orm"];

if (DatabaseOrms.filter((f) => f.tests).length === 0) {
  throw new Error("No ORMs are enabled for testing");
}

const setupDbForProvider = (provider: DatabaseOrm) => {
  return new Database(provider);
};

export const getDbForORM = (provider: DatabaseOrm) => setupDbForProvider(provider);

export const iterateORMs = (callback: (db: Database, provider: DatabaseOrm) => void) => {
  DatabaseOrms.filter((f) => f.tests).forEach(({ orm }) => {
    const db = getDbForORM(orm);
    callback(db, orm);
  });
};
