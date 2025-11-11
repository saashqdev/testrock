/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] credit`, () => {
    console.log("credit.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.credit.deleteMany();
    //   await prisma.tenant.deleteMany();
    //   await prisma.user.deleteMany();
    // });

    it(`getAllCredits: should get all credits with pagination and filters`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.credit.createMany({ data: [mockDb.credit[0], mockDb.credit[1]] });

      const result = await db.credit.getAllWithPagination({
        filters: { tenantId: mockDb.tenant[0].id, type: mockDb.credit[0].type },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.items[0].type).toBe(mockDb.credit[0].type);
    });

    it(`getAllCredits: should filter credits by userId`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.credit.createMany({ data: [mockDb.credit[0], mockDb.credit[1]] });

      const result = await db.credit.getAllWithPagination({
        filters: {
          tenantId: mockDb.tenant[0].id,
          userId: mockDb.user[0].id,
        },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].userId).toBe(mockDb.user[0].id);
    });

    it(`getAllCredits: should search credits by q`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.credit.createMany({ data: [mockDb.credit[0], mockDb.credit[1]] });

      const result = await db.credit.getAllWithPagination({
        filters: {
          tenantId: mockDb.tenant[0].id,
          q: mockDb.credit[0].type.substring(0, 3),
        },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].type).toContain(mockDb.credit[0].type.substring(0, 3));
    });

    it(`createCredit: should create a new credit`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });

      const creditData = {
        tenantId: mockDb.tenant[0].id,
        userId: mockDb.user[0].id,
        type: "Test Credit",
        objectId: "test-object-id",
        amount: 100,
      };

      const creditId = await db.credit.create(creditData);
      expect(creditId).toBeDefined();

      const createdCredit = await prisma.credit.findUnique({ where: { id: creditId } });
      expect(createdCredit).not.toBeNull();
      expect(createdCredit?.type).toBe(creditData.type);
      expect(createdCredit?.amount).toBe(creditData.amount);
    });

    it("sumAmount: should sum credit amounts with and without date range", async () => {
      const tenant = await prisma.tenant.create({ data: mockDb.tenant[0] });

      await prisma.credit.createMany({
        data: [
          { tenantId: tenant.id, amount: 100, type: "test", createdAt: "2021-01-01T00:00:00Z" },
          { tenantId: tenant.id, amount: 200, type: "test", createdAt: "2021-02-01T00:00:00Z" },
          { tenantId: tenant.id, amount: 300, type: "test", createdAt: "2021-03-01T00:00:00Z" },
        ],
      });

      // Test sum without date range
      const totalSum = await db.credit.sumAmount({ tenantId: tenant.id });
      expect(totalSum).toBe(600);

      // Test sum with date range
      const sumWithDateRange = await db.credit.sumAmount({
        tenantId: tenant.id,
        createdAt: { gte: new Date("2021-02-01"), lt: new Date("2021-03-01") },
      });
      expect(sumWithDateRange).toBe(200);
    });
  });
});
