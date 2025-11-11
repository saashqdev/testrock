import { ITenantSubscriptionProductsDb } from "@/db/interfaces/accounts/ITenantSubscriptionProductsDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { TenantSubscriptionProductWithTenantDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";
import TenantSubscriptionProductModelHelper from "@/lib/helpers/models/TenantSubscriptionProductModelHelper";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import { clearCacheKey } from "@/lib/services/cache.server";
import { clearSubscriptionsCache } from "@/utils/services/server/subscriptionService";

export class TenantSubscriptionProductsDbPrisma implements ITenantSubscriptionProductsDb {
  async getAllTenantSubscriptionProducts(
    filters?: FiltersDto,
    pagination?: { page: number; pageSize: number }
  ): Promise<{ items: TenantSubscriptionProductWithTenantDto[]; pagination: PaginationDto }> {
    let where: Prisma.TenantSubscriptionProductWhereInput = {};
    const filterTenantId = filters?.properties.find((p) => p.name === "tenantId")?.value;
    const filterSubscriptionProductId = filters?.properties.find((p) => p.name === "subscriptionProductId")?.value;
    const filterStatus = filters?.properties.find((p) => p.name === "status")?.value;

    where = {
      subscriptionProductId: filterSubscriptionProductId ? { equals: filterSubscriptionProductId } : undefined,
      tenantSubscription: {
        tenantId: filterTenantId ? { equals: filterTenantId } : undefined,
      },
    };
    if (filterStatus === "active") {
      where = {
        ...where,
        OR: [
          {
            endsAt: { gte: new Date() },
          },
          {
            endsAt: null,
          },
        ],
      };
    } else if (filterStatus === "ended") {
      where = {
        ...where,
        endsAt: { lt: new Date(), not: null },
      };
    } else if (filterStatus === "active-cancelled") {
      where = {
        ...where,
        OR: [
          {
            endsAt: { gte: new Date() },
          },
          {
            endsAt: null,
          },
        ],
        cancelledAt: { not: null },
      };
    } else if (filterStatus === "active-not-cancelled") {
      where = {
        ...where,
        OR: [
          {
            endsAt: { gte: new Date() },
          },
          {
            endsAt: null,
          },
        ],
        cancelledAt: null,
      };
    }

    const items = await prisma.tenantSubscriptionProduct.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where,
      include: {
        ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
        tenantSubscription: {
          include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalItems = await prisma.tenantSubscriptionProduct.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? 10,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
      },
    };
  }

  async getTenantSubscriptionProduct(tenantId: string, subscriptionProductId: string): Promise<TenantSubscriptionProductWithTenantDto | null> {
    return await prisma.tenantSubscriptionProduct.findFirst({
      where: {
        tenantSubscription: { tenantId },
        subscriptionProductId,
      },
      include: {
        tenantSubscription: {
          include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
        },
        ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
      },
    });
  }

  async getTenantSubscriptionProductById(id: string): Promise<TenantSubscriptionProductWithTenantDto | null> {
    return await prisma.tenantSubscriptionProduct.findUnique({
      where: {
        id,
      },
      include: {
        tenantSubscription: {
          include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
        },
        ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
      },
    });
  }

  async getTenantSubscriptionProductByStripeSubscriptionId(stripeSubscriptionId: string): Promise<TenantSubscriptionProductWithTenantDto | null> {
    return await prisma.tenantSubscriptionProduct.findFirst({
      where: {
        stripeSubscriptionId,
      },
      include: {
        tenantSubscription: {
          include: { tenant: { select: TenantModelHelper.selectSimpleTenantProperties } },
        },
        ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails,
      },
    });
  }

  async addTenantSubscriptionProduct(data: {
    tenantSubscriptionId: string;
    subscriptionProductId: string;
    stripeSubscriptionId?: string;
    quantity?: number;
    fromCheckoutSessionId?: string | null;
    prices: {
      subscriptionPriceId?: string;
      subscriptionUsageBasedPriceId?: string;
    }[];
  }) {
    return await prisma.tenantSubscriptionProduct
      .create({
        data: {
          tenantSubscriptionId: data.tenantSubscriptionId,
          subscriptionProductId: data.subscriptionProductId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          quantity: data.quantity,
          fromCheckoutSessionId: data.fromCheckoutSessionId,
          endsAt: null,
          cancelledAt: null,
          prices: {
            create: data.prices.map((price) => ({
              subscriptionPriceId: price.subscriptionPriceId,
              subscriptionUsageBasedPriceId: price.subscriptionUsageBasedPriceId,
            })),
          },
        },
        include: { tenantSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
        return item;
      });
  }

  async updateTenantSubscriptionProduct(
    id: string,
    data: {
      quantity?: number;
      cancelledAt?: Date | null;
      endsAt?: Date | null;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
    }
  ) {
    return await prisma.tenantSubscriptionProduct
      .update({
        where: { id },
        data,
        include: { tenantSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
        return item;
      });
  }

  async cancelTenantSubscriptionProduct(
    id: string,
    data: {
      cancelledAt: Date | null;
      endsAt: Date | null;
    }
  ) {
    await clearSubscriptionsCache();
    return await prisma.tenantSubscriptionProduct
      .update({
        where: { id },
        data: {
          cancelledAt: data.cancelledAt,
          endsAt: data.endsAt,
        },
        include: { tenantSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`tenantSubscription:${item.tenantSubscription.tenantId}`);
      });
  }
}
