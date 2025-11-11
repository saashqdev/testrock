import { ICreditsDb } from "@/db/interfaces/subscriptions/ICreditsDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { FilterablePropertyDto } from "@/lib/dtos/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { CreditsWithDetailsDto } from "@/db/models/subscriptions/CreditsModel";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
export class CreditsDbPrisma implements ICreditsDb {
  async getAllCredits({
    tenantId,
    filters,
    filterableProperties,
    pagination,
  }: {
    tenantId: string | null;
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: { pageSize: number; page: number };
  }): Promise<{
    items: CreditsWithDetailsDto[];
    pagination: PaginationDto;
  }> {
    const q = filters.query || "";

    const AND_filters: Prisma.CreditWhereInput[] = [];
    filterableProperties.forEach((filter) => {
      const value = filters.properties.find((f) => f.name === filter.name)?.value;
      if (value) {
        AND_filters.push({
          [filter.name]: value === "null" ? null : value,
        });
      }
    });

    const OR_filters: Prisma.CreditWhereInput[] = [];
    if (q) {
      OR_filters.push({ type: { contains: q, mode: "insensitive" } }, { objectId: { contains: q, mode: "insensitive" } });
    }

    const whereFilters: Prisma.CreditWhereInput = {};
    if (OR_filters.length > 0) {
      whereFilters.OR = OR_filters;
    }
    if (AND_filters.length > 0) {
      whereFilters.AND = AND_filters;
    }

    if (tenantId) {
      whereFilters.tenantId = tenantId;
    }
    const itemsRaw = await prisma.credit.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where: whereFilters,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
      },
    });
    const items: CreditsWithDetailsDto[] = itemsRaw.map((item) => ({
      ...item,
      tenant: {
        ...item.tenant,
        // Add any missing fields with default values if needed
      },
      user: item.user
        ? {
            ...item.user,
            admin: (item.user as any).admin ?? false,
            defaultTenantId: (item.user as any).defaultTenantId ?? null,
            avatar: (item.user as any).avatar ?? null,
          }
        : null,
    }));
    const totalItems = await prisma.credit.count({
      where: whereFilters,
    });
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async createCredit(data: { tenantId: string; userId: string | null; type: string; objectId: string | null; amount: number }) {
    return await prisma.credit.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        objectId: data.objectId,
        amount: data.amount,
      },
    });
  }
  async deleteCredits(ids: string[]) {
    return await prisma.credit.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async sumAmount(filters: { tenantId: string; createdAt?: { gte: Date; lt: Date } }): Promise<number> {
    const whereClause: Prisma.CreditWhereInput = {
      tenantId: filters.tenantId,
    };

    if (filters.createdAt) {
      whereClause.createdAt = {
        gte: filters.createdAt.gte,
        lt: filters.createdAt.lt,
      };
    }

    const result = await prisma.credit.aggregate({
      where: whereClause,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? 0;
  }
}
