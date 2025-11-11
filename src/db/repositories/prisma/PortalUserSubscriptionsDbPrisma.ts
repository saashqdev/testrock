import { IPortalUserSubscriptionsDb } from "@/db/interfaces/portals/IPortalUserSubscriptionsDb";
import { prisma } from "@/db/config/prisma/database";
import { PortalUserSubscriptionWithDetailsDto } from "@/db/models/portals/PortalUserSubscriptionsModel";
import { clearCacheKey } from "@/lib/services/cache.server";
import PortalUserSubscriptionProductModelHelper from "@/modules/portals/helpers/PortalUserSubscriptionProductModelHelper";

export class PortalUserSubscriptionsDbPrisma implements IPortalUserSubscriptionsDb {
  async getOrPersistPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetailsDto> {
    const subscription = await prisma.portalUserSubscription.findUnique({
      where: {
        portalId,
        portalUserId,
      },
      include: {
        products: {
          include: PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });

    if (!subscription) {
      return await this.createPortalUserSubscription(portalId, portalUserId, "");
    }
    return subscription;
  }

  async getPortalUserSubscription(portalId: string, portalUserId: string): Promise<PortalUserSubscriptionWithDetailsDto | null> {
    return await prisma.portalUserSubscription.findUnique({
      where: {
        portalId,
        portalUserId,
      },
      include: {
        products: {
          include: PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
          orderBy: {
            subscriptionProduct: {
              order: "desc",
            },
          },
        },
      },
    });
  }

  async getPortalUserSubscriptions(portalId: string): Promise<PortalUserSubscriptionWithDetailsDto[]> {
    return await prisma.portalUserSubscription.findMany({
      where: {
        portalId,
      },
      include: {
        products: {
          include: {
            subscriptionProduct: { include: { features: true } },
            prices: { include: { subscriptionPrice: true } },
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

  async createPortalUserSubscription(portalId: string, portalUserId: string, stripeCustomerId: string) {
    return await prisma.portalUserSubscription
      .create({
        data: {
          portalId,
          portalUserId,
          stripeCustomerId,
        },
        include: {
          products: {
            include: {
              subscriptionProduct: { include: { features: true } },
              prices: { include: { subscriptionPrice: true } },
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
        clearCacheKey(`portalUserSubscription:${portalId}:${portalUserId}`);
        return item;
      });
  }

  async updatePortalUserSubscriptionCustomerId(portalId: string, portalUserId: string, data: { stripeCustomerId: string }) {
    return await prisma.portalUserSubscription
      .update({
        where: {
          portalId,
          portalUserId,
        },
        data,
      })
      .then((item) => {
        clearCacheKey(`portalUserSubscription:${portalId}:${portalUserId}`);
        return item;
      });
  }
}
