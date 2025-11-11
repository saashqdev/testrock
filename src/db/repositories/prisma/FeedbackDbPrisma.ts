import { IFeedbackDb } from "@/db/interfaces/helpDesk/IFeedbackDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { FeedbackWithDetailsDto } from "@/db/models/helpDesk/FeedbackModel";
export class FeedbackDbPrisma implements IFeedbackDb {
  async getAllFeedback({
    filters,
    filterableProperties,
    pagination,
  }: {
    filters: FiltersDto;
    filterableProperties: FilterablePropertyDto[];
    pagination: { pageSize: number; page: number };
  }): Promise<{
    items: FeedbackWithDetailsDto[];
    pagination: PaginationDto;
  }> {
    const q = filters.query || "";

    const AND_filters: Prisma.FeedbackWhereInput[] = [];
    filterableProperties.forEach((filter) => {
      const value = filters.properties.find((f) => f.name === filter.name)?.value;
      if (value) {
        AND_filters.push({
          [filter.name]: value === "null" ? null : value,
        });
      }
    });

    const OR_filters: Prisma.FeedbackWhereInput[] = [];
    if (q) {
      OR_filters.push({
        message: {
          contains: q,
        },
      });
    }

    const whereFilters: Prisma.FeedbackWhereInput = {};
    if (OR_filters.length > 0) {
      whereFilters.OR = OR_filters;
    }
    if (AND_filters.length > 0) {
      whereFilters.AND = AND_filters;
    }

    const itemsRaw = await prisma.feedback.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
      },
    });

    // Map raw items to FeedbackWithDetailsDto
    const items: FeedbackWithDetailsDto[] = itemsRaw.map((item) => ({
      ...item,
      tenant: item.tenant
        ? {
            ...item.tenant,
            // Add/transform properties if needed to match TenantDto
          }
        : null,
      user: item.user
        ? {
            ...item.user,
            admin: (item.user as any).admin ?? false,
            defaultTenantId: (item.user as any).defaultTenantId ?? null,
            avatar: (item.user as any).avatar ?? null,
          }
        : null,
    }));

    const totalItems = await prisma.feedback.count({ where: whereFilters });
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

  async createFeedback(data: { tenantId: string | null; userId: string | null; message: string; fromUrl: string }) {
    return await prisma.feedback.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        message: data.message,
        fromUrl: data.fromUrl,
      },
    });
  }
}
