/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] role permission`, () => {
    console.log("rolePermission.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.rolePermission.deleteMany();
    //   await prisma.role.deleteMany();
    //   await prisma.permission.deleteMany();
    // });

    it(`getAll: should get all role permissions`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.permission.create({ data: mockDb.permission[0] });
      await prisma.rolePermission.create({
        data: {
          roleId: mockDb.role[0].id,
          permissionId: mockDb.permission[0].id,
        },
      });

      const rolePermissions = await db.rolePermission.getAll();
      expect(rolePermissions).toHaveLength(1);
      expect(rolePermissions[0]).toHaveProperty("permission");
    });

    it(`get: should get a specific role permission`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.permission.create({ data: mockDb.permission[0] });
      await prisma.rolePermission.create({
        data: {
          roleId: mockDb.role[0].id,
          permissionId: mockDb.permission[0].id,
        },
      });

      const rolePermission = await db.rolePermission.get(mockDb.role[0].id, mockDb.permission[0].id);
      expect(rolePermission).not.toBeNull();
      expect(rolePermission?.roleId).toBe(mockDb.role[0].id);
      expect(rolePermission?.permissionId).toBe(mockDb.permission[0].id);
    });

    it(`create: should create a new role permission`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.permission.create({ data: mockDb.permission[0] });

      const id = await db.rolePermission.create({
        roleId: mockDb.role[0].id,
        permissionId: mockDb.permission[0].id,
      });

      const createdRolePermission = await prisma.rolePermission.findUnique({ where: { id } });
      expect(createdRolePermission).not.toBeNull();
      expect(createdRolePermission?.roleId).toBe(mockDb.role[0].id);
      expect(createdRolePermission?.permissionId).toBe(mockDb.permission[0].id);
    });

    it(`deleteByRoleId: should delete role permissions by role id`, async () => {
      await prisma.role.create({ data: mockDb.role[0] });
      await prisma.permission.createMany({ data: [mockDb.permission[0], mockDb.permission[1]] });
      await prisma.rolePermission.createMany({
        data: [
          { roleId: mockDb.role[0].id, permissionId: mockDb.permission[0].id },
          { roleId: mockDb.role[0].id, permissionId: mockDb.permission[1].id },
        ],
      });

      await db.rolePermission.deleteByRoleId(mockDb.role[0].id);

      const remainingRolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: mockDb.role[0].id },
      });
      expect(remainingRolePermissions).toHaveLength(0);
    });

    it(`deleteByPermissionId: should delete role permissions by permission id`, async () => {
      await prisma.role.createMany({ data: [mockDb.role[0], mockDb.role[1]] });
      await prisma.permission.create({ data: mockDb.permission[0] });
      await prisma.rolePermission.createMany({
        data: [
          { roleId: mockDb.role[0].id, permissionId: mockDb.permission[0].id },
          { roleId: mockDb.role[1].id, permissionId: mockDb.permission[0].id },
        ],
      });

      await db.rolePermission.deleteByPermissionId(mockDb.permission[0].id);

      const remainingRolePermissions = await prisma.rolePermission.findMany({
        where: { permissionId: mockDb.permission[0].id },
      });
      expect(remainingRolePermissions).toHaveLength(0);
    });
  });
});
