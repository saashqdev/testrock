import { ISubscriptionProductsDb } from "@/db/interfaces/subscriptions/ISubscriptionProductsDb";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";
import { SubscriptionPriceType } from "@/lib/enums/subscriptions/SubscriptionPriceType";
import { prisma } from "@/db/config/prisma/database";
import { SubscriptionPriceWithProductDto, SubscriptionUsageBasedPriceWithProductDto } from "@/db/models/subscriptions/SubscriptionProductsModel";
import { SubscriptionProduct, SubscriptionPrice, SubscriptionUsageBasedPrice, SubscriptionUsageBasedTier, SubscriptionFeature } from "@prisma/client";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";

export class SubscriptionProductsDbPrisma implements ISubscriptionProductsDb {
  async getAllSubscriptionProductsWithTenants(): Promise<SubscriptionProduct[]> {
    return await prisma.subscriptionProduct
      .findMany({
        include: {
          tenantProducts: true,
          usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
          prices: true,
          assignsTenantTypes: true,
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

  async getAllSubscriptionProducts(isPublic?: boolean): Promise<
    {
      id: string;
      stripeId: string;
      order: number;
      title: string;
      active: boolean;
      model: number;
      public: boolean;
      groupTitle: string | null;
      groupDescription: string | null;
      description: string | null;
      badge: string | null;
      billingAddressCollection: string;
      hasQuantity: boolean;
      canBuyAgain: boolean;
      tenantProducts: any[];
      usageBasedPrices: any[];
      prices: any[];
      assignsTenantTypes?: any[];
      features: any[];
    }[]
  > {
    const products = await prisma.subscriptionProduct
      .findMany({
        where: isPublic
          ? {
              active: true,
              public: true,
            }
          : {
              active: true,
            },
        include: {
          tenantProducts: true,
          usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
          prices: true,
          assignsTenantTypes: true,
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

    // Coalesce undefined to null for nullable fields
    return products.map((p) => ({
      ...p,
      groupTitle: p.groupTitle ?? null,
      groupDescription: p.groupDescription ?? null,
      description: p.description ?? null,
      badge: p.badge ?? null,
    }));
  }

  async getSubscriptionProductsInIds(ids: string[]): Promise<SubscriptionProduct[]> {
    return await prisma.subscriptionProduct.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        tenantProducts: true,
        usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
        prices: true,
        assignsTenantTypes: true,
        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async getAllSubscriptionFeatures(): Promise<{ name: string; order: number; title: string; type: number; value: number; accumulate: boolean }[]> {
    return await prisma.subscriptionFeature.findMany({
      select: { name: true, order: true, title: true, type: true, value: true, accumulate: true },
    });
  }

  async getSubscriptionProduct(id: string): Promise<{
    id: string;
    stripeId: string;
    order: number;
    title: string;
    active: boolean;
    model: number;
    public: boolean;
    groupTitle: string | null;
    groupDescription: string | null;
    description: string | null;
    badge: string | null;
    billingAddressCollection: string;
    hasQuantity: boolean;
    canBuyAgain: boolean;
    tenantProducts: any[];
    usageBasedPrices: any[];
    prices: any[];
    assignsTenantTypes?: any[];
    features: any[];
  } | null> {
    const product = await prisma.subscriptionProduct.findUnique({
      where: {
        id,
      },
      include: {
        tenantProducts: true,
        usageBasedPrices: { include: { tiers: { orderBy: { from: "asc" } } } },
        prices: true,
        assignsTenantTypes: true,
        features: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      groupTitle: product.groupTitle ?? null,
      groupDescription: product.groupDescription ?? null,
      description: product.description ?? null,
      badge: product.badge ?? null,
    };
  }

  async getSubscriptionProductByStripeId(stripeId: string) {
    return await prisma.subscriptionProduct.findFirst({
      where: {
        stripeId,
      },
    });
  }

  async getSubscriptionPrices(): Promise<SubscriptionPriceWithProductDto[]> {
    return await prisma.subscriptionPrice
      .findMany({
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

  async getSubscriptionPrice(id: string): Promise<SubscriptionPriceWithProductDto | null> {
    return await prisma.subscriptionPrice
      .findUnique({
        where: { id },
        include: {
          subscriptionProduct: true,
        },
      })
      .catch(() => {
        return null;
      });
  }

  async getSubscriptionPriceByStripeId(stripeId: string): Promise<SubscriptionPriceWithProductDto | null> {
    return await prisma.subscriptionPrice
      .findFirst({
        where: { stripeId },
        include: {
          subscriptionProduct: true,
        },
      })
      .catch(() => {
        return null;
      });
  }

  async getSubscriptionUsageBasedPriceByStripeId(stripeId: string): Promise<SubscriptionUsageBasedPriceWithProductDto | null> {
    return await prisma.subscriptionUsageBasedPrice
      .findFirst({
        where: { stripeId },
        include: {
          subscriptionProduct: true,
        },
      })
      .catch(() => {
        return null;
      });
  }

  async createSubscriptionProduct(data: {
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
  }): Promise<SubscriptionProduct> {
    return await prisma.subscriptionProduct.create({
      data: {
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

  async updateSubscriptionProduct(
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
  ): Promise<SubscriptionProduct> {
    return await prisma.subscriptionProduct.update({
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

  async updateSubscriptionProductStripeId(id: string, data: { stripeId: string }) {
    return await prisma.subscriptionProduct.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateSubscriptionPriceStripeId(id: string, data: { stripeId: string }) {
    return await prisma.subscriptionPrice.update({
      where: {
        id,
      },
      data,
    });
  }

  async createSubscriptionPrice(data: {
    subscriptionProductId: string;
    stripeId: string;
    type: SubscriptionPriceType;
    billingPeriod: SubscriptionBillingPeriod;
    price: number;
    currency: string;
    trialDays: number;
    active: boolean;
  }): Promise<SubscriptionPrice> {
    return await prisma.subscriptionPrice.create({ data });
  }

  async createSubscriptionUsageBasedPrice(data: {
    subscriptionProductId: string;
    stripeId: string;
    currency: string;
    billingPeriod: SubscriptionBillingPeriod;
    unit: string;
    unitTitle: string;
    unitTitlePlural: string;
    usageType: string;
    aggregateUsage: string;
    tiersMode: string;
    billingScheme: string;
  }): Promise<SubscriptionUsageBasedPrice> {
    return await prisma.subscriptionUsageBasedPrice.create({ data });
  }

  async createSubscriptionUsageBasedTier(data: {
    subscriptionUsageBasedPriceId: string;
    from: number;
    to: number | undefined;
    perUnitPrice: number | undefined;
    flatFeePrice: number | undefined;
  }): Promise<SubscriptionUsageBasedTier> {
    return await prisma.subscriptionUsageBasedTier.create({ data });
  }

  async createSubscriptionFeature(
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
  ): Promise<SubscriptionFeature> {
    return await prisma.subscriptionFeature.create({
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
  }

  async deleteSubscriptionProduct(id: string) {
    return await prisma.subscriptionProduct.delete({
      where: {
        id,
      },
    });
  }

  async deleteSubscriptionPrice(id: string) {
    return await prisma.subscriptionPrice.delete({
      where: {
        id,
      },
    });
  }

  async deleteSubscriptionUsageBasedTier(id: string) {
    return await prisma.subscriptionUsageBasedTier.delete({
      where: {
        id,
      },
    });
  }

  async deleteSubscriptionUsageBasedPrice(id: string) {
    return await prisma.subscriptionUsageBasedPrice.delete({
      where: {
        id,
      },
    });
  }

  async deleteSubscriptionFeatures(subscriptionProductId: string) {
    return await prisma.subscriptionFeature.deleteMany({
      where: {
        subscriptionProductId,
      },
    });
  }
}
