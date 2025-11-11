import { IPortalUserSubscriptionProductsDb } from "@/db/interfaces/portals/IPortalUserSubscriptionProductsDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { clearCacheKey } from "@/lib/services/cache.server";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { PortalUserSubscriptionProductWithTenantDto } from "@/db/models/portals/PortalUserSubscriptionProductsModel";
import PortalUserSubscriptionProductModelHelper from "@/modules/portals/helpers/PortalUserSubscriptionProductModelHelper";
import PortalSubscriptionServer from "@/modules/portals/services/PortalSubscription.server";

export class PortalUserSubscriptionProductsDbPrisma implements IPortalUserSubscriptionProductsDb {
  async getAllPortalUserSubscriptionProducts(
    portalId: string,
    filters?: FiltersDto,
    pagination?: { page: number; pageSize: number }
  ): Promise<{ items: PortalUserSubscriptionProductWithTenantDto[]; pagination: PaginationDto }> {
    let where: Prisma.PortalUserSubscriptionProductWhereInput = {};
    const filterPortalUserId = filters?.properties.find((p) => p.name === "portalUserId")?.value;
    const filterSubscriptionProductId = filters?.properties.find((p) => p.name === "subscriptionProductId")?.value;
    const filterStatus = filters?.properties.find((p) => p.name === "status")?.value;

    where = {
      subscriptionProductId: filterSubscriptionProductId ? { equals: filterSubscriptionProductId } : undefined,
      portalUserSubscription: {
        portalUserId: filterPortalUserId ? { equals: filterPortalUserId } : undefined,
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

    const items = await prisma.portalUserSubscriptionProduct.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where: {
        portalId,
        ...where,
      },
      include: {
        ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
        portalUserSubscription: {
          include: { portalUser: { select: { id: true, email: true } } },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalItems = await prisma.portalUserSubscriptionProduct.count({
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

  async getPortalUserSubscriptionProduct(
    portalId: string,
    portalUserId: string,
    subscriptionProductId: string
  ): Promise<PortalUserSubscriptionProductWithTenantDto | null> {
    return await prisma.portalUserSubscriptionProduct.findFirst({
      where: {
        portalId,
        portalUserSubscription: { portalUserId },
        subscriptionProductId,
      },
      include: {
        portalUserSubscription: {
          include: { portalUser: { select: { id: true, email: true } } },
        },
        ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
      },
    });
  }

  async getPortalUserSubscriptionProductById(portalId: string, id: string): Promise<PortalUserSubscriptionProductWithTenantDto | null> {
    return await prisma.portalUserSubscriptionProduct.findUnique({
      where: {
        portalId,
        id,
      },
      include: {
        portalUserSubscription: {
          include: { portalUser: { select: { id: true, email: true } } },
        },
        ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
      },
    });
  }

  async getPortalUserSubscriptionProductByStripeSubscriptionId(
    portalId: string,
    stripeSubscriptionId: string
  ): Promise<PortalUserSubscriptionProductWithTenantDto | null> {
    return await prisma.portalUserSubscriptionProduct.findFirst({
      where: {
        portalId,
        stripeSubscriptionId,
      },
      include: {
        portalUserSubscription: {
          include: { portalUser: { select: { id: true, email: true } } },
        },
        ...PortalUserSubscriptionProductModelHelper.includePortalUserSubscriptionProductDetails,
      },
    });
  }

  async addPortalUserSubscriptionProduct(data: {
    portalId: string;
    portalUserSubscriptionId: string;
    subscriptionProductId: string;
    stripeSubscriptionId?: string;
    quantity?: number;
    fromCheckoutSessionId?: string | null;
    prices: {
      subscriptionPriceId?: string;
    }[];
  }) {
    return await prisma.portalUserSubscriptionProduct
      .create({
        data: {
          portalId: data.portalId,
          portalUserSubscriptionId: data.portalUserSubscriptionId,
          subscriptionProductId: data.subscriptionProductId,
          stripeSubscriptionId: data.stripeSubscriptionId,
          quantity: data.quantity,
          fromCheckoutSessionId: data.fromCheckoutSessionId,
          endsAt: null,
          cancelledAt: null,
          prices: {
            create: data.prices.map((price) => ({
              portalId: data.portalId,
              subscriptionPriceId: price.subscriptionPriceId,
            })),
          },
        },
        include: { portalUserSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
        return item;
      });
  }

  async updatePortalUserSubscriptionProduct(
    portalId: string,
    id: string,
    data: {
      quantity?: number;
      cancelledAt?: Date | null;
      endsAt?: Date | null;
    }
  ) {
    return await prisma.portalUserSubscriptionProduct
      .update({
        where: { portalId, id },
        data,
        include: { portalUserSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
        return item;
      });
  }

  async cancelPortalUserSubscriptionProduct(
    portalId: string,
    id: string,
    data: {
      cancelledAt: Date | null;
      endsAt: Date | null;
    }
  ) {
    await PortalSubscriptionServer.clearSubscriptionsCache(portalId);
    return await prisma.portalUserSubscriptionProduct
      .update({
        where: { portalId, id },
        data: {
          cancelledAt: data.cancelledAt,
          endsAt: data.endsAt,
        },
        include: { portalUserSubscription: true },
      })
      .then((item) => {
        clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserSubscription.portalUserId}`);
      });
  }
}
