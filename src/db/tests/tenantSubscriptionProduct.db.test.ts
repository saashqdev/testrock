/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] tenant subscription product`, () => {
    console.log("tenantSubscriptionProduct.db.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.tenantSubscriptionProduct.deleteMany();
    //   await prisma.tenantSubscription.deleteMany();
    //   await prisma.subscriptionProduct.deleteMany();
    // });

    it("get: should get a tenant subscription product by id", async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.tenantSubscriptionProduct.create({ data: mockDb.tenantSubscriptionProduct[0] });

      const product = await db.tenantSubscriptionProduct.get(mockDb.tenantSubscriptionProduct[0].id);
      expect(product).not.toBeNull();
      expect(product?.id).toBe(mockDb.tenantSubscriptionProduct[0].id);
    });

    it("getByStripeSubscriptionId: should get a tenant subscription product by stripe subscription id", async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.tenantSubscriptionProduct.create({ data: mockDb.tenantSubscriptionProduct[0] });

      const product = await db.tenantSubscriptionProduct.getByStripeSubscriptionId(mockDb.tenantSubscriptionProduct[0].stripeSubscriptionId!);
      expect(product).not.toBeNull();
      expect(product?.id).toBe(mockDb.tenantSubscriptionProduct[0].id);
    });

    it("create: should create a new tenant subscription product", async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });

      const createData = {
        tenantSubscriptionId: mockDb.tenantSubscription[0].id,
        subscriptionProductId: mockDb.subscriptionProduct[0].id,
        stripeSubscriptionId: "stripe_sub_id",
        quantity: 1,
        fromCheckoutSessionId: null,
        prices: [],
        // prices: [{ subscriptionPriceId: "price_id_1" }, { subscriptionUsageBasedPriceId: "usage_price_id_1" }],
      };

      const productId = await db.tenantSubscriptionProduct.create(createData);
      const createdProduct = await prisma.tenantSubscriptionProduct.findUnique({ where: { id: productId } });
      expect(createdProduct).not.toBeNull();
      expect(createdProduct?.tenantSubscriptionId).toBe(createData.tenantSubscriptionId);
      expect(createdProduct?.subscriptionProductId).toBe(createData.subscriptionProductId);
    });

    it("update: should update a tenant subscription product", async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantSubscription.create({ data: mockDb.tenantSubscription[0] });
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.tenantSubscriptionProduct.create({ data: mockDb.tenantSubscriptionProduct[0] });

      const updateData = {
        cancelledAt: new Date(),
        endsAt: new Date(),
      };

      await db.tenantSubscriptionProduct.update(mockDb.tenantSubscriptionProduct[0].id, updateData);
      const updatedProduct = await prisma.tenantSubscriptionProduct.findUnique({ where: { id: mockDb.tenantSubscriptionProduct[0].id } });
      expect(updatedProduct?.cancelledAt).toEqual(updateData.cancelledAt);
      expect(updatedProduct?.endsAt).toEqual(updateData.endsAt);
    });
  });
});
