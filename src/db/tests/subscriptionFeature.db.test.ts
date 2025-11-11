/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";
import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";

iterateORMs((db, orm) => {
  describe(`[${orm}] subscription feature`, () => {
    console.log("subscriptionFeature.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.subscriptionFeature.deleteMany();
    //   await prisma.subscriptionProduct.deleteMany();
    // });

    it(`getAllSubscriptionFeatures: should get all subscription features`, async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.subscriptionFeature.create({ data: mockDb.subscriptionFeature[0] });

      const features = await db.subscriptionFeature.getAll();
      expect(features).toHaveLength(1);
      expect(features[0].title).toBe(mockDb.subscriptionFeature[0].title);
    });

    it(`get: should get a specific subscription feature`, async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.subscriptionFeature.create({ data: mockDb.subscriptionFeature[0] });

      const feature = await db.subscriptionFeature.get(mockDb.subscriptionFeature[0].id);
      expect(feature).not.toBeNull();
      expect(feature?.title).toBe(mockDb.subscriptionFeature[0].title);
    });

    it(`createSubscriptionFeature: should create a new subscription feature`, async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });

      const newFeature = {
        order: 1,
        title: "New Feature",
        name: "new_feature",
        type: SubscriptionFeatureLimitType.UNLIMITED,
        value: 0,
        href: "https://example.com",
        badge: "New",
        accumulate: false,
      };

      const id = await db.subscriptionFeature.create(mockDb.subscriptionProduct[0].id, newFeature);
      const createdFeature = await db.subscriptionFeature.get(id);

      expect(createdFeature).not.toBeNull();
      expect(createdFeature?.title).toBe(newFeature.title);
      expect(createdFeature?.type).toBe(newFeature.type);
    });

    it(`deleteBySubscriptionProductId: should delete all features for a subscription product`, async () => {
      await prisma.subscriptionProduct.create({ data: mockDb.subscriptionProduct[0] });
      await prisma.subscriptionFeature.createMany({
        data: [
          { ...mockDb.subscriptionFeature[0], subscriptionProductId: mockDb.subscriptionProduct[0].id },
          { ...mockDb.subscriptionFeature[1], subscriptionProductId: mockDb.subscriptionProduct[0].id },
        ],
      });

      await db.subscriptionFeature.deleteBySubscriptionProductId(mockDb.subscriptionProduct[0].id);

      const remainingFeatures = await prisma.subscriptionFeature.findMany({
        where: { subscriptionProductId: mockDb.subscriptionProduct[0].id },
      });
      expect(remainingFeatures).toHaveLength(0);
    });
  });
});
