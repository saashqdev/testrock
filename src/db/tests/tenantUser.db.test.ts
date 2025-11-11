/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] tenant user`, () => {
    // eslint-disable-next-line no-console
    console.log("tenantUser.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.tenantUser.deleteMany();
    //   await prisma.tenant.deleteMany();
    //   await prisma.user.deleteMany();
    //   await prisma.role.deleteMany();
    // });

    it(`getAll: should get all tenant users for a tenant`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1], mockDb.user[2]] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[1] });
      const users = await db.tenantUser.getAll(mockDb.tenantUser[0].tenantId);
      const emails = users.map((u) => u.user.email);
      expect(users).toHaveLength(2);
      expect(emails).toContain(mockDb.user[0].email);
      expect(emails).toContain(mockDb.user[1].email);
      expect(emails).not.toContain(mockDb.user[2].email);
    });

    it(`get: should get a tenant user by tenantId and userId`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });
      const tenantUser = await db.tenantUser.get({
        tenantId: mockDb.tenantUser[0].tenantId,
        userId: mockDb.tenantUser[0].userId,
      });
      expect(tenantUser).not.toBeNull();
      expect(tenantUser?.userId).toBe(mockDb.user[0].id);
      expect(tenantUser?.tenantId).toBe(mockDb.tenant[0].id);
    });

    it(`get: should return null if tenant user not found`, async () => {
      const tenantUser = await db.tenantUser.get({ tenantId: "1", userId: "1" });
      expect(tenantUser).toBeNull();
    });

    it(`getById: should get a tenant user by id`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      const { id } = await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });
      const tenantUser = await db.tenantUser.getById(id);
      expect(tenantUser).not.toBeNull();
      expect(tenantUser?.user.id).toBe(mockDb.user[0].id);
    });

    it(`getById: should return null if tenant user not found`, async () => {
      const tenantUser = await db.tenantUser.getById("1");
      expect(tenantUser).toBeNull();
    });

    it(`count: should count tenant users`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[1] });
      const count = await db.tenantUser.count(mockDb.tenantUser[0].tenantId);
      expect(count).toBe(2);
    });

    it(`countByCreatedAt: should count tenant users created within a date range`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });
      await prisma.tenantUser.create({ data: { ...mockDb.tenantUser[0], createdAt: new Date("2021-06-01") } });
      await prisma.tenantUser.create({ data: { ...mockDb.tenantUser[1], createdAt: new Date("2021-06-02") } });
      const countZero = await db.tenantUser.countByCreatedAt(mockDb.tenantUser[0].tenantId, {
        gte: new Date("2021-06-03"),
        lt: new Date("2021-06-04"),
      });
      const countOne = await db.tenantUser.countByCreatedAt(mockDb.tenantUser[0].tenantId, {
        gte: new Date("2021-06-01"),
        lt: new Date("2021-06-02"),
      });
      const countTwo = await db.tenantUser.countByCreatedAt(mockDb.tenantUser[0].tenantId, {
        gte: new Date("2021-06-01"),
        lt: new Date("2021-06-03"),
      });

      expect(countZero).toBe(0);
      expect(countOne).toBe(1);
      expect(countTwo).toBe(2);
    });

    it(`create: should create a new tenant user`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      const id = await db.tenantUser.create({ tenantId: mockDb.tenant[0].id, userId: mockDb.user[0].id });
      const tenantUser = await db.tenantUser.getById(id);
      expect(tenantUser).not.toBeNull();
      expect(tenantUser?.userId).toBe(mockDb.user[0].id);
      expect(tenantUser?.tenantId).toBe(mockDb.tenant[0].id);
    });

    it(`del: should delete a tenant user`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      const { id } = await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });
      await db.tenantUser.del(id);
      const tenantUser = await db.tenantUser.getById(id);
      expect(tenantUser).toBeNull();
    });
  });
});
