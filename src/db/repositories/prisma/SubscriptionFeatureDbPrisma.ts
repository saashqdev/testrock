import { prisma } from "@/db/config/prisma/database";
import { ISubscriptionFeatureDb } from "@/db/interfaces/subscriptions/ISubscriptionFeatureDb";
import { SubscriptionFeatureModel } from "@/db/models/subscriptions/SubscriptionFeatureModel";
import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";

export class SubscriptionFeatureDbPrisma implements ISubscriptionFeatureDb {
  async getAll(): Promise<SubscriptionFeatureModel[]> {
    return await prisma.subscriptionFeature.findMany();
  }
  async get(id: string): Promise<SubscriptionFeatureModel | null> {
    return await prisma.subscriptionFeature.findUnique({
      where: {
        id,
      },
    });
  }
  async create(
    subscriptionProductId: string,
    data: {
      order: number;
      title: string;
      name: string;
      type: SubscriptionFeatureLimitType;
      value: number;
      href?: string | null;
      badge?: string | null;
      accumulate?: boolean;
    }
  ): Promise<string> {
    const item = await prisma.subscriptionFeature.create({
      data: {
        subscriptionProductId,
        order: data.order,
        title: data.title,
        name: data.name,
        type: data.type,
        value: data.value,
        href: data.href,
        badge: data.badge,
        accumulate: data.accumulate,
      },
    });
    return item.id;
  }
  async deleteBySubscriptionProductId(subscriptionProductId: string): Promise<void> {
    await prisma.subscriptionFeature.deleteMany({
      where: {
        subscriptionProductId,
      },
    });
  }
}
