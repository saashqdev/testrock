/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] userRole`, () => {
    // eslint-disable-next-line no-console
    console.log("userRole.db.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.userRole.deleteMany();
    //   await prisma.role.deleteMany();
    //   await prisma.user.deleteMany();
    // });

    it(`get: should get user role`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      const userRole = await db.userRole.get({
        userId: mockDb.userRole[0].userId,
        roleId: mockDb.userRole[0].roleId,
        tenantId: mockDb.userRole[0].tenantId,
      });

      expect(userRole).not.toBeNull();
      expect(userRole?.userId).toBe(mockDb.userRole[0].userId);
    });

    it(`getInTenant: should get user role in tenant`, async () => {
      await prisma.user.create({ data: mockDb.user[1] });
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.role.create({ data: mockDb.role[1] });
      await prisma.userRole.create({ data: mockDb.userRole[3] });

      const userRole = await db.userRole.getInTenant(mockDb.userRole[3].userId, mockDb.userRole[3].tenantId!, mockDb.role[1].name);

      expect(userRole).not.toBeNull();
      expect(userRole?.userId).toBe(mockDb.userRole[3].userId);
    });

    it(`getInAdmin: should get user role in admin`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      const userRole = await db.userRole.getInAdmin(mockDb.userRole[0].userId, mockDb.role[0].name);

      expect(userRole).not.toBeNull();
      expect(userRole?.userId).toBe(mockDb.userRole[0].userId);
      expect(userRole?.tenantId).toBeNull();
    });

    it(`getPermissionsByUser: should get permissions by user`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      const permissions = await db.userRole.getPermissionsByUser(mockDb.userRole[0].userId, mockDb.userRole[0].tenantId);

      expect(permissions).not.toBeNull();
      expect(permissions).toHaveLength(1);
      expect(permissions[0].role.name).toBe(mockDb.role[0].name);
    });

    it(`countUserPermission: should count user permissions`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.permission.createMany({ data: [mockDb.permission[0], mockDb.permission[1]] });
      await prisma.rolePermission.createMany({ data: [mockDb.rolePermission[0], mockDb.rolePermission[1]] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      const count = await db.userRole.countPermissionByUser(mockDb.userRole[0].userId, mockDb.userRole[0].tenantId, mockDb.permission[0].name);

      expect(count).toBe(1);
    });

    it(`create: should create a new user role`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });

      const userRoleId = await db.userRole.create({
        userId: mockDb.user[0].id,
        roleId: mockDb.role[0].id,
        tenantId: mockDb.userRole[0].tenantId,
      });

      expect(userRoleId).not.toBeNull();
      const userRole = await prisma.userRole.findUnique({
        where: { id: userRoleId },
      });
      expect(userRole).not.toBeNull();
    });

    it(`createMany: should create multiple user roles`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });

      await db.userRole.createMany(mockDb.user[0].id, [{ id: mockDb.role[0].id, tenantId: mockDb.userRole[0].tenantId }]);

      const userRoles = await prisma.userRole.findMany({
        where: { userId: mockDb.user[0].id },
      });

      expect(userRoles).toHaveLength(1);
    });

    it(`del: should delete a user role`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      await db.userRole.del(mockDb.userRole[0].userId, mockDb.userRole[0].roleId);

      const userRole = await prisma.userRole.findFirst({
        where: {
          userId: mockDb.userRole[0].userId,
          roleId: mockDb.userRole[0].roleId,
        },
      });
      expect(userRole).toBeNull();
    });

    it(`deleteAllByUser: should delete all user roles`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.userRole.create({ data: mockDb.userRole[0] });

      await db.userRole.deleteAllByUser(mockDb.userRole[0].userId, mockDb.role[0].type);

      const userRoles = await prisma.userRole.findMany({
        where: { userId: mockDb.userRole[0].userId },
      });

      expect(userRoles).toHaveLength(0);
    });
  });
});
