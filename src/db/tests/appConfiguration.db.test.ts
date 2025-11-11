/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] appConfiguration`, () => {
    // eslint-disable-next-line no-console
    console.log("appConfiguration.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.appConfiguration.deleteMany();
    // });

    it(`get: should get the configuration`, async () => {
      await prisma.appConfiguration.create({ data: mockDb.appConfiguration[0] });
      const config = await db.appConfiguration.get();
      expect(config).not.toBeNull();
    });

    it(`create: should create the configuration`, async () => {
      await prisma.appConfiguration.create({ data: mockDb.appConfiguration[0] });
      const config = await db.appConfiguration.get();
      expect(config).not.toBeNull();
      expect(config?.name).toBe(mockDb.appConfiguration[0].name);
    });

    it(`update: should update the configuration`, async () => {
      await prisma.appConfiguration.create({ data: mockDb.appConfiguration[0] });
      await db.appConfiguration.update({ name: "Updated App Name" });
      const newConfig = await db.appConfiguration.get();
      expect(newConfig?.name).toBe("Updated App Name");
    });

    it(`del: should delete the configuration`, async () => {
      await db.appConfiguration.deleteAll();
      const config = await db.appConfiguration.get();
      expect(config).toBeNull();
    });
  });
});
