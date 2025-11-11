import { prisma } from "@/db/config/prisma/database";
import { ITenantIpAddressDb } from "@/db/interfaces/accounts/ITenantIpAddressDb";
import { TenantIpAddressWithDetailsDto } from "@/db/models/accounts/TenantIpAddressModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import * as Constants from "@/lib/constants";

export class TenantIpAddressDbPrisma implements ITenantIpAddressDb {
  async getAllTenantIpAddresses(pagination?: {
    page: number;
    pageSize: number;
  }): Promise<{ items: TenantIpAddressWithDetailsDto[]; pagination: PaginationDto }> {
    const items = await prisma.tenantIpAddress.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      include: {
        tenant: true,
        user: {
          select: UserModelHelper.selectSimpleUserProperties,
        },
        apiKey: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    const totalItems = await prisma.tenantIpAddress.count({});

    return {
      items: { ...items },
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
      },
    };
  }

  async createUniqueTenantIpAddress(data: { ip: string; fromUrl: string; tenantId: string; userId?: string | null; apiKeyId?: string | null }): Promise<void> {
    const existing = await prisma.tenantIpAddress.findFirst({
      where: {
        ip: data.ip,
        tenantId: data.tenantId,
        userId: data.userId,
        apiKeyId: data.apiKeyId,
      },
    });
    if (!existing) {
      await prisma.tenantIpAddress.create({ data });
    }
  }
}
