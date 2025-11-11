/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] tenant`, () => {
    // eslint-disable-next-line no-console
    console.log("tenant.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.tenant.deleteMany();
    //   await prisma.user.deleteMany();
    //   await prisma.subscriptionProduct.deleteMany();
    // });

    it(`getAll: should get all tenants`, async () => {
      await prisma.tenant.createMany({ data: [mockDb.tenant[0], mockDb.tenant[1]] });
      const tenants = await db.tenant.getAll();
      expect(tenants).toHaveLength(2);
      expect(tenants[0]).toHaveProperty("users");
      expect(tenants[0]).toHaveProperty("subscription");
    });

    it(`getAllIdsAndNames: should get all tenant ids and names`, async () => {
      await prisma.tenant.createMany({ data: [mockDb.tenant[0], mockDb.tenant[1]] });
      const tenants = await db.tenant.getAllIdsAndNames();
      expect(tenants).toHaveLength(2);
      expect(tenants[0]).toHaveProperty("id");
      expect(tenants[0]).toHaveProperty("name");
      expect(tenants[0]).toHaveProperty("slug");
    });

    it(`getAllWithPagination: should get tenants with pagination and filters`, async () => {
      await prisma.tenant.createMany({ data: [mockDb.tenant[0], mockDb.tenant[1]] });

      const result = await db.tenant.getAllWithPagination({
        filters: { name: mockDb.tenant[0].name, active: true },
        pagination: { page: 1, pageSize: 10 },
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.items[0].name).toBe(mockDb.tenant[0].name);
    });

    it(`getByUser: should get tenants for a specific user`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.create({ data: mockDb.user[0] });
      await prisma.tenantUser.create({ data: mockDb.tenantUser[0] });

      const tenants = await db.tenant.getByUser(mockDb.user[0].id);
      expect(tenants).toHaveLength(1);
      expect(tenants[0].id).toBe(mockDb.tenant[0].id);
    });

    it(`get: should get a tenant by id with details`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      const tenant = await db.tenant.get(id);
      expect(tenant).not.toBeNull();
      expect(tenant?.name).toBe(mockDb.tenant[0].name);
      expect(tenant).toHaveProperty("users");
      expect(tenant).toHaveProperty("subscription");
    });

    it(`get: tenant with users`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.user.createMany({ data: [mockDb.user[0], mockDb.user[1]] });
      await prisma.tenantUser.createMany({ data: [mockDb.tenantUser[0], mockDb.tenantUser[1]] });

      const tenant = await db.tenant.get(mockDb.tenant[0].id);
      const tenantUserEmails = tenant?.users.map((u) => u.user.email);

      expect(tenant?.users).toHaveLength(2);
      expect(tenant?.users[0].user).toHaveProperty("email");
      expect(tenantUserEmails).toContain(mockDb.user[0].email);
      expect(tenantUserEmails).toContain(mockDb.user[1].email);
    });

    it(`get: tenant with subscription`, async () => {
      const subscriptionProduct = await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      const tenant1 = await prisma.tenant.create({
        data: {
          ...mockDb.tenant[0],
          subscription: {
            create: {
              stripeCustomerId: "1",
              products: {
                create: {
                  subscriptionProductId: subscriptionProduct.id,
                  cancelledAt: null,
                  endsAt: null,
                  stripeSubscriptionId: "1",
                  quantity: 1,
                },
              },
            },
          },
        },
      });
      const tenant = await db.tenant.get(tenant1.id);
      expect(tenant).not.toBeNull();
      expect(tenant?.subscription).not.toBeNull();
      expect(tenant?.subscription?.products).toHaveLength(1);
      expect(tenant?.subscription?.products[0].subscriptionProduct).not.toBeNull();
      expect(tenant?.subscription?.products[0].subscriptionProduct.title).toBe(subscriptionProduct.title);
    });

    it(`getSimple: should get a simple tenant by id`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      const tenant = await db.tenant.getSimple(id);
      expect(tenant).not.toBeNull();
      expect(tenant?.name).toBe(mockDb.tenant[0].name);
      expect(tenant).not.toHaveProperty("users");
      expect(tenant).not.toHaveProperty("subscription");
    });

    it(`getByIdOrSlug: should get a tenant by id or slug`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      const tenantById = await db.tenant.getByIdOrSlug(id);
      expect(tenantById).not.toBeNull();
      expect(tenantById?.name).toBe(mockDb.tenant[0].name);

      const tenantBySlug = await db.tenant.getByIdOrSlug(mockDb.tenant[0].slug);
      expect(tenantBySlug).not.toBeNull();
      expect(tenantBySlug?.name).toBe(mockDb.tenant[0].name);
    });

    it(`getIdByIdOrSlug: should get a tenant id by id or slug`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      const idById = await db.tenant.getIdByIdOrSlug(id);
      expect(idById).toBe(id);

      const idBySlug = await db.tenant.getIdByIdOrSlug(mockDb.tenant[0].slug);
      expect(idBySlug).toBe(id);
    });

    it(`countBySlug: should count tenants by slug`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const count = await db.tenant.countBySlug(mockDb.tenant[0].slug);
      expect(count).toBe(1);
    });

    it(`create: should create a new tenant`, async () => {
      const tenantId = await db.tenant.create(mockDb.tenant[0]);
      const tenant = await db.tenant.get(tenantId);
      expect(tenant).not.toBeNull();
      expect(tenant?.name).toBe(mockDb.tenant[0].name);
    });

    it(`update: should update a tenant`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      await db.tenant.update(id, {
        name: "Updated Tenant",
        icon: "new-icon",
        slug: "updated-slug",
      });
      const updatedTenant = await db.tenant.get(id);
      expect(updatedTenant).not.toBeNull();
      expect(updatedTenant?.name).toBe("Updated Tenant");
      expect(updatedTenant?.icon).toBe("new-icon");
      expect(updatedTenant?.slug).toBe("updated-slug");
    });

    it(`del: should delete a tenant`, async () => {
      const { id } = await prisma.tenant.create({ data: mockDb.tenant[0] });
      await db.tenant.del(id);
      const tenant = await db.tenant.get(id);
      expect(tenant).toBeNull();
    });

    it(`deleteAll: should delete all tenants`, async () => {
      await prisma.tenant.createMany({ data: [mockDb.tenant[0], mockDb.tenant[1]] });
      await db.tenant.deleteAll();
      const tenants = await db.tenant.getAll();
      expect(tenants).toHaveLength(0);
    });
  });
});
