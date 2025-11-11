// eslint-disable-next-line no-console

import { describe, it, expect, beforeEach } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] permission`, () => {
    console.log("permission.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.permission.deleteMany();
    //   await prisma.role.deleteMany();
    //   await prisma.rolePermission.deleteMany();
    // });

    it("getAll: should get all permissions", async () => {
      await prisma.permission.createMany({ data: mockDb.permission });
      const permissions = await db.permission.getAll();
      expect(permissions).toHaveLength(mockDb.permission.length);
    });

    it("getAll: should filter by type", async () => {
      await prisma.permission.createMany({ data: mockDb.permission });
      const adminPermissions = await db.permission.getAll({ type: "admin" });
      expect(adminPermissions.every((p) => p.type === "admin")).toBe(true);
    });

    it("getAllIdsAndNames: should get all permission ids and names", async () => {
      await prisma.permission.createMany({ data: mockDb.permission });
      const permissions = await db.permission.getAllIdsAndNames();
      expect(permissions).toHaveLength(mockDb.permission.length);
      expect(permissions[0]).toHaveProperty("id");
      expect(permissions[0]).toHaveProperty("name");
      expect(permissions[0]).toHaveProperty("description");
    });

    it("get: should get a specific permission", async () => {
      const permission = await prisma.permission.create({ data: mockDb.permission[0] });
      const item = await db.permission.get(permission.id);
      expect(item).not.toBeNull();
      expect(item?.name).toBe(mockDb.permission[0].name);
    });

    it("getByName: should get a permission by name", async () => {
      await prisma.permission.createMany({ data: [mockDb.permission[0]] });
      const permission = await db.permission.getByName(mockDb.permission[0].name);
      expect(permission).not.toBeNull();
      expect(permission?.name).toBe(mockDb.permission[0].name);
    });

    it("getMaxOrder: should get the max order", async () => {
      await prisma.permission.createMany({ data: mockDb.permission });
      const maxOrder = await db.permission.getMaxOrder("admin");
      expect(maxOrder).toBe(Math.max(...mockDb.permission.filter((p) => p.type === "admin").map((p) => p.order)));
    });

    it("create: should create a new permission", async () => {
      const newPermission = {
        order: 1,
        name: "New Permission",
        description: "New Description",
        type: "admin",
        isDefault: true,
      };
      const id = await db.permission.create(newPermission);
      const createdPermission = await prisma.permission.findUnique({ where: { id } });
      expect(createdPermission).not.toBeNull();
      expect(createdPermission?.name).toBe(newPermission.name);
    });

    it("update: should update a permission", async () => {
      const permission = await prisma.permission.create({ data: mockDb.permission[0] });
      await db.permission.update(permission.id, { name: "Updated Permission" });
      const updatedPermission = await prisma.permission.findUnique({ where: { id: permission.id } });
      expect(updatedPermission?.name).toBe("Updated Permission");
    });

    it("del: should delete a permission", async () => {
      const permission = await prisma.permission.create({ data: mockDb.permission[0] });
      await db.permission.del(permission.id);
      const deletedPermission = await prisma.permission.findUnique({ where: { id: permission.id } });
      expect(deletedPermission).toBeNull();
    });
  });
});
