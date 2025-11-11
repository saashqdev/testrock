import { prisma } from "@/db/config/prisma/database";
import { ITenantSubscriptionsDb } from "@/db/interfaces/subscriptions/ITenantSubscriptionsDb";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { clearCacheKey } from "@/lib/services/cache.server";
import TenantSubscriptionProductModelHelper from "@/lib/helpers/models/TenantSubscriptionProductModelHelper";

export class TenantSubscriptionsDbPrisma implements ITenantSubscriptionsDb {
  async getOrPersistTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetailsDto> {
    const subscription = await prisma.tenantSubscription.findUnique({
      where: {
        tenantId,
      },
      include: {
        products: {
          include: TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });

    if (!subscription) {
      return await this.createTenantSubscription(tenantId, "");
    }
    return subscription;
  }

  async getTenantSubscription(tenantId: string): Promise<TenantSubscriptionWithDetailsDto | null> {
    return await prisma.tenantSubscription.findUnique({
      where: {
        tenantId,
      },
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: {
              include: {
                subscriptionPrice: true,
                subscriptionUsageBasedPrice: { include: { tiers: true } },
              },
            },
          },
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });
  }

  async getTenantSubscriptions(): Promise<TenantSubscriptionWithDetailsDto[]> {
    return await prisma.tenantSubscription.findMany({
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
          },
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });
  }

  async createTenantSubscription(tenantId: string, stripeCustomerId: string) {
    return await prisma.tenantSubscription
      .create({
        data: {
          tenantId,
          stripeCustomerId,
        },
        include: {
          products: {
            include: {
              subscriptionProduct: { include: { features: true } },
              prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
            },
            orderBy: {
              subscriptionProduct: {
                order: "desc",
              },
            },
          },
        },
      })
      .then((item) => {
        clearCacheKey(`tenantSubscription:${tenantId}`);
        return item;
      });
  }

  async updateTenantSubscriptionCustomerId(tenantId: string, data: { stripeCustomerId: string }): Promise<TenantSubscriptionWithDetailsDto> {
    const updated = await prisma.tenantSubscription.update({
      where: {
        tenantId,
      },
      data,
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: { include: { subscriptionPrice: true, subscriptionUsageBasedPrice: { include: { tiers: true } } } },
          },
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });
    clearCacheKey(`tenantSubscription:${tenantId}`);
    return updated;
  }

  async createUsageRecord(data: {
    tenantSubscriptionProductPriceId: string;
    timestamp: number;
    quantity: number;
    stripeSubscriptionItemId: string;
  }): Promise<string> {
    const item = await prisma.tenantSubscriptionUsageRecord.create({
      data: {
        tenantSubscriptionProductPriceId: data.tenantSubscriptionProductPriceId,
        timestamp: data.timestamp,
        quantity: data.quantity,
        stripeSubscriptionItemId: data.stripeSubscriptionItemId,
      },
    });
    return item.id;
  }
}
