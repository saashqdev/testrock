/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] subscription product`, () => {
    console.log("subscriptionProduct.db.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.subscriptionProduct.deleteMany();
    //   await prisma.subscriptionPrice.deleteMany();
    //   await prisma.subscriptionUsageBasedPrice.deleteMany();
    //   await prisma.subscriptionUsageBasedTier.deleteMany();
    // });

    it("getAllSubscriptionProductsWithTenants: should get all subscription products with tenants", async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      const products = await db.subscriptionProduct.getAllSubscriptionProductsWithTenants();
      expect(products).toHaveLength(1);
      expect(products[0].title).toBe(mockDb.subscriptionProduct[0].title);
    });

    it("getAllSubscriptionProducts: should get all active subscription products", async () => {
      await prisma.subscriptionProduct.createMany({ data: mockDb.subscriptionProduct });
      const products = await db.subscriptionProduct.getAllSubscriptionProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.active)).toBe(true);
    });

    it("getSubscriptionProductsInIds: should get subscription products by ids", async () => {
      await prisma.subscriptionProduct.createMany({ data: mockDb.subscriptionProduct });
      const ids = mockDb.subscriptionProduct.map((p) => p.id);
      const products = await db.subscriptionProduct.getSubscriptionProductsInIds(ids);
      expect(products).toHaveLength(ids.length);
    });

    it("getSubscriptionProduct: should get a subscription product by id", async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      const product = await db.subscriptionProduct.getSubscriptionProduct(mockDb.subscriptionProduct[0].id);
      expect(product).not.toBeNull();
      expect(product?.id).toBe(mockDb.subscriptionProduct[0].id);
    });

    it("createSubscriptionProduct: should create a new subscription product", async () => {
      const { id, ...data } = mockDb.subscriptionProduct[0];
      const productId = await db.subscriptionProduct.createSubscriptionProduct(data);
      const createdProduct = await prisma.subscriptionProduct.findUnique({ where: { id: productId } });
      expect(createdProduct).not.toBeNull();
      expect(createdProduct?.title).toBe(data.title);
    });

    it("updateSubscriptionProduct: should update a subscription product", async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      const updateData = {
        title: "Updated Product",
        order: 2,
        model: mockDb.subscriptionProduct[0].model,
        public: true,
        billingAddressCollection: "auto",
      };
      await db.subscriptionProduct.updateSubscriptionProduct(mockDb.subscriptionProduct[0].id, updateData);
      const updatedProduct = await prisma.subscriptionProduct.findUnique({ where: { id: mockDb.subscriptionProduct[0].id } });
      expect(updatedProduct?.title).toBe(updateData.title);
    });

    it("deleteSubscriptionProduct: should delete a subscription product", async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await db.subscriptionProduct.deleteSubscriptionProduct(mockDb.subscriptionProduct[0].id);
      const deletedProduct = await prisma.subscriptionProduct.findUnique({ where: { id: mockDb.subscriptionProduct[0].id } });
      expect(deletedProduct).toBeNull();
    });

    // Add more tests for other methods as needed
  });
});
