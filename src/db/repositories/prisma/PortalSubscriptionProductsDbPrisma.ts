import { IPortalSubscriptionProductsDb } from "@/db/interfaces/portals/IPortalSubscriptionProductsDb";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { prisma } from "@/db/config/prisma/database";
import { PortalSubscriptionProduct, PortalSubscriptionPrice, PortalSubscriptionFeature } from "@prisma/client";
import { PortalSubscriptionPriceWithProductDto } from "@/db/models/portals/PortalSubscriptionProductsModel";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";
import { SubscriptionPriceType } from "@/lib/enums/subscriptions/SubscriptionPriceType";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";

export class PortalSubscriptionProductsDbPrisma implements IPortalSubscriptionProductsDb {
  async getAllPortalSubscriptionProductsWithUsers(portalId: string): Promise<SubscriptionProductDto[]> {
    return await prisma.portalSubscriptionProduct
      .findMany({
        where: {
          portalId,
        },
        include: {
          portalUserProducts: true,

          prices: true,

          features: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: [{ public: "desc" }, { order: "asc" }],
      })
      .catch(() => {
        return [];
      });
  }

  async getAllPortalSubscriptionProducts(portalId: string, isPublic?: boolean): Promise<SubscriptionProductDto[]> {
    if (isPublic) {
      return await prisma.portalSubscriptionProduct
        .findMany({
          where: {
            portalId,
            active: true,
            public: true,
          },
          include: {
            portalUserProducts: true,

            prices: true,

            features: {
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        })
        .catch(() => {
          return [];
        });
    }
    return await prisma.portalSubscriptionProduct
      .findMany({
        where: {
          portalId,
          active: true,
        },
        include: {
          portalUserProducts: true,

          prices: true,

          features: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      })
      .catch(() => {
        return [];
      });
  }

  async getPortalSubscriptionProductsInIds(portalId: string, ids: string[]): Promise<SubscriptionProductDto[]> {
    return await prisma.portalSubscriptionProduct.findMany({
      where: {
        portalId,
        id: { in: ids },
      },
      include: {
        portalUserProducts: true,

        prices: true,

        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async getAllPortalSubscriptionFeatures(
    portalId: string
  ): Promise<{ name: string; order: number; title: string; type: number; value: number; accumulate: boolean }[]> {
    return await prisma.portalSubscriptionFeature.findMany({
      where: {
        portalId,
      },
      select: { name: true, order: true, title: true, type: true, value: true, accumulate: true },
    });
  }

  async getPortalSubscriptionProduct(portalId: string, id: string): Promise<SubscriptionProductDto | null> {
    return await prisma.portalSubscriptionProduct.findUnique({
      where: {
        portalId,
        id,
      },
      include: {
        portalUserProducts: true,

        prices: true,

        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async getPortalSubscriptionProductByStripeId(portalId: string, stripeId: string) {
    return await prisma.portalSubscriptionProduct.findFirst({
      where: {
        portalId,
        stripeId,
      },
    });
  }

  async getPortalSubscriptionPrices(portalId: string): Promise<PortalSubscriptionPriceWithProductDto[]> {
    return await prisma.portalSubscriptionPrice
      .findMany({
        where: {
          portalId,
        },
        include: {
          subscriptionProduct: true,
        },
        orderBy: [
          {
            subscriptionProduct: {
              order: "asc",
            },
          },
          {
            price: "asc",
          },
        ],
      })
      .catch(() => {
        return [];
      });
  }

  async getPortalSubscriptionPrice(portalId: string, id: string): Promise<PortalSubscriptionPriceWithProductDto | null> {
    return await prisma.portalSubscriptionPrice
      .findUnique({
        where: { portalId, id },
        include: {
          subscriptionProduct: true,
        },
      })
      .catch(() => {
        return null;
      });
  }

  async getPortalSubscriptionPriceByStripeId(portalId: string, stripeId: string): Promise<PortalSubscriptionPriceWithProductDto | null> {
    return await prisma.portalSubscriptionPrice
      .findFirst({
        where: { portalId, stripeId },
        include: {
          subscriptionProduct: true,
        },
      })
      .catch(() => {
        return null;
      });
  }

  async createPortalSubscriptionProduct(data: {
    portalId: string;
    stripeId: string;
    order: number;
    title: string;
    model: PricingModel;
    description?: string;
    badge?: string;
    groupTitle?: string;
    groupDescription?: string;
    active: boolean;
    public: boolean;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
  }): Promise<PortalSubscriptionProduct> {
    return await prisma.portalSubscriptionProduct.create({
      data: {
        portalId: data.portalId,
        stripeId: data.stripeId,
        order: data.order,
        title: data.title,
        model: data.model,
        description: data.description,
        badge: data.badge,
        groupTitle: data.groupTitle,
        groupDescription: data.groupDescription,
        active: data.active,
        public: data.public,
        billingAddressCollection: data.billingAddressCollection,
        hasQuantity: data.hasQuantity,
        canBuyAgain: data.canBuyAgain,
      },
    });
  }

  async updatePortalSubscriptionProduct(
    portalId: string,
    id: string,
    data: {
      stripeId?: string;
      order?: number;
      title?: string;
      model?: PricingModel;
      description?: string | null;
      badge?: string | null;
      groupTitle?: string | null;
      groupDescription?: string | null;
      public?: boolean;
      billingAddressCollection?: string;
      hasQuantity?: boolean;
      canBuyAgain?: boolean;
    }
  ): Promise<PortalSubscriptionProduct> {
    return await prisma.portalSubscriptionProduct.update({
      where: {
        id,
      },
      data: {
        stripeId: data.stripeId,
        order: data.order,
        title: data.title,
        model: data.model,
        description: data.description,
        badge: data.badge,
        groupTitle: data.groupTitle,
        groupDescription: data.groupDescription,
        public: data.public,
        billingAddressCollection: data.billingAddressCollection,
        hasQuantity: data.hasQuantity,
        canBuyAgain: data.canBuyAgain,
      },
    });
  }

  async updatePortalSubscriptionProductStripeId(portalId: string, id: string, data: { stripeId: string }) {
    return await prisma.portalSubscriptionProduct.update({
      where: {
        portalId,
        id,
      },
      data,
    });
  }

  async updatePortalSubscriptionPriceStripeId(portalId: string, id: string, data: { stripeId: string }) {
    return await prisma.portalSubscriptionPrice.update({
      where: {
        portalId,
        id,
      },
      data,
    });
  }

  async createPortalSubscriptionPrice(data: {
    portalId: string;
    subscriptionProductId: string;
    stripeId: string;
    type: SubscriptionPriceType;
    billingPeriod: SubscriptionBillingPeriod;
    price: number;
    currency: string;
    trialDays: number;
    active: boolean;
  }): Promise<PortalSubscriptionPrice> {
    return await prisma.portalSubscriptionPrice.create({
      data: {
        portalId: data.portalId,
        subscriptionProductId: data.subscriptionProductId,
        stripeId: data.stripeId,
        type: data.type,
        billingPeriod: data.billingPeriod,
        price: data.price,
        currency: data.currency,
        trialDays: data.trialDays,
        active: data.active,
      },
    });
  }

  async createPortalSubscriptionFeature(
    portalId: string,
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
  ): Promise<PortalSubscriptionFeature> {
    return await prisma.portalSubscriptionFeature.create({
      data: {
        portalId,
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
  }

  async deletePortalSubscriptionProduct(portalId: string, id: string) {
    return await prisma.portalSubscriptionProduct.delete({
      where: {
        portalId,
        id,
      },
    });
  }

  async deletePortalSubscriptionPrice(portalId: string, id: string) {
    return await prisma.portalSubscriptionPrice.delete({
      where: {
        portalId,
        id,
      },
    });
  }

  async deletePortalSubscriptionFeatures(portalId: string, subscriptionProductId: string) {
    return await prisma.portalSubscriptionFeature.deleteMany({
      where: {
        portalId,
        subscriptionProductId,
      },
    });
  }
}
