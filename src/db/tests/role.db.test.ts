/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] role`, () => {
    // eslint-disable-next-line no-console
    console.log("roles.db.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.role.deleteMany();
    //   await prisma.permission.deleteMany();
    // });

    it(`getAll: should get all roles`, async () => {
      await prisma.role.createMany({
        data: [
          { ...mockDb.role[0], type: "admin" },
          { ...mockDb.role[1], type: "app" },
        ],
      });
      const roles = await db.role.getAll();
      expect(roles).toHaveLength(2);
      expect(roles[0].type).toBe("admin");
      expect(roles[1].type).toBe("app");
    });

    it(`getAllNames: should get all role names`, async () => {
      await prisma.role.createMany({
        data: [{ ...mockDb.role[0] }, { ...mockDb.role[1] }],
      });
      const roles = await db.role.getAllNames();
      expect(roles).toHaveLength(2);
      expect(roles[0].name).toBe(mockDb.role[0].name);
      expect(roles[1].name).toBe(mockDb.role[1].name);
    });

    it(`getAllWithoutPermissions: should get all roles without permissions`, async () => {
      await prisma.role.createMany({
        data: [{ ...mockDb.role[0] }, { ...mockDb.role[1] }],
      });
      const roles = await db.role.getAllWithoutPermissions();
      expect(roles).toHaveLength(2);
      expect(roles[0].name).toBe(mockDb.role[0].name);
      expect(roles[1].name).toBe(mockDb.role[1].name);
    });

    it(`getAllWithUsers: should get all roles with users`, async () => {
      await prisma.role.createMany({
        data: [{ ...mockDb.role[0] }, { ...mockDb.role[1] }],
      });
      await prisma.user.create({
        data: {
          ...mockDb.user[0],
          roles: {
            create: [{ roleId: mockDb.role[0].id }],
          },
        },
      });
      const roles = await db.role.getAllWithUsers();
      expect(roles).toHaveLength(2);
      expect(roles[0].users).toHaveLength(1);
      expect(roles[1].users).toHaveLength(0);
    });

    it(`getAllInIds: should get roles by ids`, async () => {
      await prisma.role.createMany({
        data: [{ ...mockDb.role[0] }, { ...mockDb.role[1] }],
      });
      const roles = await db.role.getAllInIds([mockDb.role[0].id]);
      expect(roles).toHaveLength(1);
      expect(roles[0].id).toBe(mockDb.role[0].id);
    });

    it(`get: should get a role by id`, async () => {
      await prisma.role.create({
        data: { ...mockDb.role[0] },
      });
      const role = await db.role.get(mockDb.role[0].id);
      expect(role).not.toBeNull();
      expect(role?.id).toBe(mockDb.role[0].id);
    });

    it(`getByName: should get a role by name`, async () => {
      await prisma.role.create({
        data: { ...mockDb.role[0] },
      });
      const role = await db.role.getByName(mockDb.role[0].name);
      expect(role).not.toBeNull();
      expect(role?.name).toBe(mockDb.role[0].name);
    });

    it(`getMaxOrder: should get the max order`, async () => {
      await prisma.role.create({
        data: { ...mockDb.role[0], order: 1 },
      });
      const nextOrder = await db.role.getMaxOrder();
      expect(nextOrder).toBe(1);
    });

    it(`getMaxOrder: should get the max order when no rows`, async () => {
      const nextOrder = await db.role.getMaxOrder();
      expect(nextOrder).toBe(0);
    });

    it(`create: should create a new role`, async () => {
      const id = await db.role.create({
        order: 1,
        name: mockDb.role[0].name,
        description: mockDb.role[0].description,
        type: mockDb.role[0].type as "admin" | "app",
        assignToNewUsers: mockDb.role[0].assignToNewUsers,
        isDefault: mockDb.role[0].isDefault,
      });
      const role = await db.role.get(id);
      expect(role).not.toBeNull();
      expect(role?.name).toBe(mockDb.role[0].name);
    });

    it(`update: should update a role`, async () => {
      const { id } = await prisma.role.create({
        data: { ...mockDb.role[0] },
      });
      await db.role.update(id, {
        name: "updated",
        description: "updated",
        type: "app",
        assignToNewUsers: true,
      });
      const role = await db.role.get(id);
      expect(role).not.toBeNull();
      expect(role?.name).toBe("updated");
    });

    it(`del: should delete a role`, async () => {
      const { id } = await prisma.role.create({
        data: { ...mockDb.role[0] },
      });
      await db.role.del(id);
      const role = await db.role.get(id);
      expect(role).toBeNull();
    });
  });
});
