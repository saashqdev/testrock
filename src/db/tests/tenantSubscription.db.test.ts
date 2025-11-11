/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] tenant subscription`, () => {
    // eslint-disable-next-line no-console
    console.log("tenantSubscription.test.ts", orm.toString());

    it(`getAll: should get all tenant subscriptions`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });

      const subscriptions = await db.tenantSubscription.getAll();
      expect(subscriptions).toHaveLength(1);
    });

    it(`get: should get a specific tenant subscription`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });

      const subscription = await db.tenantSubscription.get(mockDb.tenantSubscription[0].tenantId);
      expect(subscription).not.toBeNull();
      expect(subscription?.tenantId).toBe(mockDb.tenantSubscription[0].tenantId);
    });

    it(`get: should get a tenant subscription with products`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[1] });
      await prisma.tenantSubscriptionProduct.createMany({ data: [mockDb.tenantSubscriptionProduct[0], mockDb.tenantSubscriptionProduct[1]] });

      const subscription = await db.tenantSubscription.get(mockDb.tenantSubscription[0].id);
      const productTitles = subscription?.products.map((p) => p.subscriptionProduct.title);

      expect(subscription).not.toBeNull();
      expect(subscription?.products).toHaveLength(2);
      expect(productTitles).toContain(mockDb.subscriptionProduct[0].title);
      expect(productTitles).toContain(mockDb.subscriptionProduct[1].title);
    });

    it(`create: should create a new tenant subscription`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const id = await db.tenantSubscription.create({
        tenantId: mockDb.tenant[0].id,
        stripeCustomerId: "stripe-customer-id",
      });
      expect(id).toBe(mockDb.tenant[0].id);

      const createdSubscription = await prisma.tenantSubscription.findUnique({
        where: { tenantId: id },
      });
      expect(createdSubscription).not.toBeNull();
      expect(createdSubscription?.stripeCustomerId).toBe("stripe-customer-id");
    });

    it(`update: should update a tenant subscription`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });

      await db.tenantSubscription.update(mockDb.tenantSubscription[0].tenantId, {
        stripeCustomerId: "new-stripe-customer-id",
      });

      const updatedSubscription = await prisma.tenantSubscription.findUnique({
        where: { tenantId: mockDb.tenantSubscription[0].tenantId },
      });
      expect(updatedSubscription).not.toBeNull();
      expect(updatedSubscription?.stripeCustomerId).toBe("new-stripe-customer-id");
    });
  });
});
