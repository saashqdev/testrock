/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] user`, () => {
    // eslint-disable-next-line no-console
    console.log("user.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.user.deleteMany();
    //   await prisma.tenant.deleteMany();
    //   await prisma.tenantUser.deleteMany();
    //   await prisma.role.deleteMany();
    // });

    it(`getAllWhereTenant: should get all users where tenant`, async () => {
      await prisma.user.create({
        data: {
          ...mockDb.user[0],
          tenants: {
            create: [
              {
                tenant: {
                  create: {
                    id: "1",
                    slug: "test-1",
                    name: "Test 1",
                  },
                },
              },
              {
                tenant: {
                  create: {
                    id: "2",
                    slug: "test-2",
                    name: "Test 2",
                  },
                },
              },
            ],
          },
          roles: {
            create: [
              {
                role: {
                  create: {
                    id: "1",
                    name: "Admin",
                    description: "",
                    type: "admin",
                    assignToNewUsers: true,
                    isDefault: true,
                    order: 1,
                  },
                },
              },
              {
                role: {
                  create: {
                    id: "2",
                    name: "User",
                    description: "",
                    type: "app",
                    assignToNewUsers: true,
                    isDefault: true,
                    order: 2,
                  },
                },
              },
            ],
          },
        },
      });
      const users = await db.user.getAllWhereTenant("1");
      expect(users).toHaveLength(1);
      expect(users[0].tenants).toHaveLength(2);
      expect(users[0].roles).toHaveLength(2);

      const tenantSlugs = users[0].tenants.map((t) => t.tenant.slug);
      expect(tenantSlugs).toContain("test-1");
      expect(tenantSlugs).toContain("test-2");

      const roleNames = users[0].roles.map((r) => r.role.name);
      expect(roleNames).toContain("Admin");
      expect(roleNames).toContain("User");
    });

    it(`getAllWithPagination: should get all users with pagination`, async () => {
      for (let i = 1; i <= 20; i++) {
        await prisma.user.create({
          data: {
            ...mockDb.user[0],
            id: `${i}`,
            email: `${mockDb.user[0].email}+${i}`,
          },
        });
      }
      const users = await db.user.getAllWithPagination({
        filters: {},
        pagination: {
          pageSize: 10,
          page: 1,
        },
      });
      expect(users.items).toHaveLength(10);
      expect(users.pagination.totalItems).toBe(20);
    });

    it(`getAllWithPagination: should get all users with pagination filter by email`, async () => {
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });
      const users = await db.user.getAllWithPagination({
        filters: {
          email: mockDb.user[0].email,
        },
        pagination: {
          pageSize: 10,
          page: 1,
        },
      });
      expect(users.items).toHaveLength(1);
      expect(users.pagination.totalItems).toBe(1);
      expect(users.items[0].email).toBe(mockDb.user[0].email);
    });

    it(`getAllWithPagination: should filter users by firstName`, async () => {
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });

      const users = await db.user.getAllWithPagination({
        filters: { firstName: mockDb.user[0].firstName },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(users.items).toHaveLength(1);
      expect(users.items[0].firstName).toBe(mockDb.user[0].firstName);
    });

    it(`getAllWithPagination: should filter users by lastName`, async () => {
      await prisma.user.createMany({
        data: [
          { ...mockDb.user[0], lastName: "Doe" },
          { ...mockDb.user[1], lastName: "Doe" },
        ],
      });

      const users = await db.user.getAllWithPagination({
        filters: { lastName: "Doe" },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(users.items).toHaveLength(2);
      expect(users.pagination.totalItems).toBe(2);
      expect(users.items[0].lastName).toBe("Doe");
      expect(users.items[1].lastName).toBe("Doe");
    });

    it(`getAllWithPagination: should filter users by tenantId`, async () => {
      await prisma.tenant.createMany({ data: [mockDb.tenant[0], mockDb.tenant[1]] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });

      const users = await db.user.getAllWithPagination({
        filters: { tenantId: mockDb.tenant[0].id },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(users.items).toHaveLength(1);
      expect(users.items[0].tenants).toHaveLength(1);
      expect(users.items[0].tenants[0].tenant.slug).toBe(mockDb.tenant[0].slug);
    });

    it(`getAllWithPagination: should filter users by admin status`, async () => {
      await prisma.user.create({ data: { ...mockDb.user[0], admin: false } });
      await prisma.user.create({ data: { ...mockDb.user[1], admin: true } });
      await prisma.user.create({ data: { ...mockDb.user[2], admin: false } });

      const regularUsers = await db.user.getAllWithPagination({
        filters: { admin: false },
        pagination: { page: 1, pageSize: 10 },
      });

      const adminUsers = await db.user.getAllWithPagination({
        filters: { admin: true },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(regularUsers.items).toHaveLength(2);
      expect(adminUsers.items).toHaveLength(1);
    });

    it(`getAll: should get all users`, async () => {
      await prisma.user.create({ data: mockDb.user[0] });
      const users = await db.user.getAll();
      expect(users).toHaveLength(1);
    });

    it(`get: should get a user`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      const user = await db.user.get(id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockDb.user[0].email);
      expect(user?.id).toBe(id);
    });

    it(`getByEmail: should get a user by email`, async () => {
      await prisma.user.create({ data: mockDb.user[0] });
      const user = await db.user.getByEmail(mockDb.user[0].email);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockDb.user[0].email);
    });

    it(`getByEmailWithDetails: should get a user by email with details`, async () => {
      await prisma.user.create({ data: mockDb.user[0] });
      const user = await db.user.getByEmailWithDetails(mockDb.user[0].email);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockDb.user[0].email);
    });

    it(`getPasswordHash: should get a user's password hash`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      const passwordHash = await db.user.getPasswordHash(id);
      expect(passwordHash).not.toBeNull();
      expect(passwordHash).toBe(mockDb.user[0].passwordHash);
    });

    it(`getVerifyToken: should get a user's verify token`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      const verifyToken = await db.user.getVerifyToken(id);
      expect(verifyToken).toBeNull();
    });

    it(`count: should count all users`, async () => {
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1], mockDb.user[2]] });
      const count = await db.user.count();
      expect(count).toBe(3);
    });

    it(`create: should create a new user`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      const user = await db.user.get(id);
      expect(user).not.toBeNull();
      expect(user?.email).toBe(mockDb.user[0].email);
    });

    // update
    it(`update: should update a user`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      await db.user.update(id, {
        firstName: "updated",
        lastName: "updated",
        avatar: "updated",
        locale: "updated",
        // verifyToken: "updated",
        // passwordHash: "updated",
        defaultTenantId: "updated",
        admin: true,
      });
      const user = await db.user.get(id);
      expect(user).not.toBeNull();
      expect(user?.firstName).toBe("updated");
      expect(user?.lastName).toBe("updated");
      expect(user?.avatar).toBe("updated");
      expect(user?.locale).toBe("updated");
      // expect(user?.verifyToken).toBe("updated");
      // expect(user?.passwordHash).toBe("updated");
      expect(user?.defaultTenantId).toBe("updated");
      expect(user?.admin).toBe(true);
    });

    it(`del: should delete a user`, async () => {
      const { id } = await prisma.user.create({ data: mockDb.user[0] });
      await db.user.del(id);
      const user = await db.user.get(id);
      expect(user).toBeNull();
    });

    it(`deleteAll: should delete all users`, async () => {
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });
      const items = await db.user.getAll();
      expect(items).toHaveLength(2);

      await db.user.deleteAll();
      const users = await db.user.getAll();
      expect(users).toHaveLength(0);
    });

    it(`unique email: should throw an error when creating a user with the same email`, async () => {
      await prisma.user.create({ data: mockDb.user[0] });
      await expect(db.user.create(mockDb.user[0])).rejects.toThrow();
    });
  });
});
