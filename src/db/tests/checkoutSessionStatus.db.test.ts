/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] checkout session status`, () => {
    console.log("checkoutSessionStatus.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.checkoutSessionStatus.deleteMany();
    // });

    it(`getCheckoutSessionStatus: should get a checkout session status`, async () => {
      const mockStatus = mockDb.checkoutSessionStatus[0];
      await prisma.checkoutSessionStatus.create({ data: mockStatus });

      const status = await db.checkoutSessionStatus.get(mockStatus.id);
      expect(status).not.toBeNull();
      expect(status?.id).toBe(mockStatus.id);
      expect(status?.email).toBe(mockStatus.email);
    });

    it(`createCheckoutSessionStatus: should create a new checkout session status`, async () => {
      const mockStatus = mockDb.checkoutSessionStatus[0];
      const id = await db.checkoutSessionStatus.create({
        id: mockStatus.id,
        email: mockStatus.email,
        fromUrl: mockStatus.fromUrl,
        fromUserId: mockStatus.fromUserId,
        fromTenantId: mockStatus.fromTenantId,
      });

      const createdStatus = await prisma.checkoutSessionStatus.findUnique({ where: { id } });
      expect(createdStatus).not.toBeNull();
      expect(createdStatus?.email).toBe(mockStatus.email);
      expect(createdStatus?.pending).toBe(true);
    });

    it(`updateCheckoutSessionStatus: should update a checkout session status`, async () => {
      const mockStatus = mockDb.checkoutSessionStatus[0];
      await prisma.checkoutSessionStatus.create({ data: mockStatus });

      await db.checkoutSessionStatus.update(mockStatus.id, {
        pending: false,
        createdUserId: "test-user-id",
        createdTenantId: "test-tenant-id",
      });

      const updatedStatus = await prisma.checkoutSessionStatus.findUnique({ where: { id: mockStatus.id } });
      expect(updatedStatus).not.toBeNull();
      expect(updatedStatus?.pending).toBe(false);
      expect(updatedStatus?.createdUserId).toBe("test-user-id");
      expect(updatedStatus?.createdTenantId).toBe("test-tenant-id");
    });
  });
});
