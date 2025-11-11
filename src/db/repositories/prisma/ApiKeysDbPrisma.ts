import { IApiKeysDb } from "@/db/interfaces/apiKeys/IApiKeysDb";
import { prisma } from "@/db/config/prisma/database";
import { ApiKeyLogWithDetailsDto, ApiKeyWithDetailsDto, ApiKeyLogDto, ApiKeyDto } from "@/db/models/apiKeys/ApiKeysModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import UrlUtils from "@/utils/app/UrlUtils";
import { getClientIPAddress } from "@/utils/server/IpUtils";

const include = {
  tenant: { select: { id: true, name: true, slug: true, deactivatedReason: true } },
  entities: {
    include: {
      entity: { select: { id: true, title: true, titlePlural: true, slug: true } },
    },
  },
  createdByUser: {
    select: {
      id: true,
      createdAt: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      githubId: true,
      googleId: true,
      locale: true,
      admin: true,
      defaultTenantId: true,
      avatar: true,
      username: true,
    },
  },
  _count: {
    select: {
      apiKeyLogs: true,
    },
  },
};
export class ApiKeysDbPrisma implements IApiKeysDb {
  async getAllApiKeys(): Promise<ApiKeyWithDetailsDto[]> {
    return await prisma.apiKey.findMany({
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAllApiKeyLogs(
    pagination: { page: number; pageSize: number },
    filters: FiltersDto
  ): Promise<{ items: ApiKeyLogWithDetailsDto[]; pagination: PaginationDto }> {
    const where = RowFiltersHelper.getFiltersCondition(filters);
    const items = await prisma.apiKeyLog.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include: {
        apiKey: {
          include: { tenant: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const totalItems = await prisma.apiKeyLog.count({
      where,
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

  async getAllApiKeyLogsSimple(tenantId?: string): Promise<ApiKeyLogDto[]> {
    let where: any = {};
    if (tenantId) {
      where = {
        apiKey: {
          tenantId,
        },
      };
    }
    return await prisma.apiKeyLog.findMany({
      where,
      select: {
        apiKeyId: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getTenantApiKeyLogs(
    tenantId: string,
    pagination: { page: number; pageSize: number },
    filters: FiltersDto
  ): Promise<{ items: ApiKeyLogWithDetailsDto[]; pagination: PaginationDto }> {
    const where = {
      AND: [RowFiltersHelper.getFiltersCondition(filters), { apiKey: { tenantId } }],
    };
    const items = await prisma.apiKeyLog.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include: { apiKey: { include: { tenant: true } } },
      orderBy: { createdAt: "desc" },
    });
    const totalItems = await prisma.apiKeyLog.count({ where });
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

  async getApiKeys(tenantId: string): Promise<ApiKeyWithDetailsDto[]> {
    return await prisma.apiKey.findMany({
      where: {
        tenantId,
      },
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getApiKeyById(id: string): Promise<ApiKeyWithDetailsDto | null> {
    return await prisma.apiKey.findUnique({
      where: { id },
      include,
    });
  }

  async getApiKey(key: string): Promise<ApiKeyDto | null> {
    return await cachified({
      key: `apiKey:${key}`,
      ttl: 1000 * 60 * 60,
      getFreshValue: () =>
        prisma.apiKey
          .findFirst({
            where: { key },
            select: {
              id: true,
              alias: true,
              expires: true,
              tenantId: true,
              active: true,
              entities: { select: { create: true, read: true, update: true, delete: true, entityId: true } },
              tenant: { select: { id: true, name: true, slug: true, deactivatedReason: true } },
            },
          })
          .catch(() => {
            return null;
          }),
    });
  }

  async getApiKeyByAlias(tenantId: string, alias: string): Promise<ApiKeyWithDetailsDto | null> {
    return await prisma.apiKey.findFirst({
      where: { tenantId, alias },
      include,
    });
  }

  async getApiKeyLogs(id: string): Promise<ApiKeyLogWithDetailsDto[]> {
    return await prisma.apiKeyLog.findMany({
      where: {
        apiKeyId: id,
      },
      include: {
        apiKey: {
          include: {
            tenant: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getFirstApiKey(tenantId: string | null) {
    if (!tenantId) {
      return null;
    }
    return await prisma.apiKey
      .findFirstOrThrow({
        where: {
          tenantId,
          active: true,
        },
      })
      .catch(() => null);
  }

  async createApiKey(
    data: {
      tenantId: string;
      createdByUserId: string;
      alias: string;
      expires: Date | null;
      active: boolean;
    },
    entities: {
      entityId: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }[]
  ) {
    const apiKey = await prisma.apiKey.create({
      data: {
        ...data,
        active: true,
      },
    });
    await Promise.all(
      entities.map(async (entity) => {
        return await prisma.apiKeyEntity.create({
          data: {
            apiKeyId: apiKey.id,
            entityId: entity.entityId,
            create: entity.create,
            read: entity.read,
            update: entity.update,
            delete: entity.delete,
          },
        });
      })
    );
    return apiKey;
  }

  async createApiKeyLog(
    request: Request,
    data: {
      tenantId: string | null;
      apiKeyId: string | null;
      endpoint: string;
      error?: string;
      status?: number;
    }
  ) {
    return await prisma.apiKeyLog.create({
      data: {
        tenantId: data.tenantId,
        apiKeyId: data.apiKeyId,
        endpoint: data.endpoint,
        error: data.error,
        status: data.status,
        ip: getClientIPAddress(request.headers)?.toString() ?? "",
        method: request.method,
        params: UrlUtils.searchParamsToString({
          type: "object",
          searchParams: new URL(request.url).searchParams,
        }),
      },
    });
  }

  async setApiKeyLogStatus(
    id: string,
    data: {
      status: number;
      startTime: number | null;
      error?: string | null;
    }
  ) {
    let duration: number | null = null;
    if (data.startTime) {
      const endTime = performance.now();
      duration = Number(endTime - data.startTime);
    }
    return await prisma.apiKeyLog.update({
      where: { id },
      data: {
        status: data.status,
        error: data.error,
        duration,
      },
    });
  }

  async updateApiKey(
    id: string,
    data: {
      tenantId: string;
      alias: string;
      expires: Date | null;
      active: boolean;
    },
    entities: {
      entityId: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }[]
  ) {
    await prisma.apiKey
      .update({
        where: { id },
        data,
      })
      .then((item) => {
        clearCacheKey(`apiKey:${item.key}`);
        return item;
      });
    await prisma.apiKeyEntity.deleteMany({
      where: {
        apiKeyId: id,
      },
    });
    await Promise.all(
      entities.map(async (entity) => {
        return await prisma.apiKeyEntity.create({
          data: {
            apiKeyId: id,
            ...entity,
          },
        });
      })
    );
  }

  async deleteApiKey(id: string) {
    return await prisma.apiKey
      .delete({
        where: { id },
      })
      .then((item) => {
        clearCacheKey(`apiKey:${item.key}`);
        return item;
      });
  }

  async countTenantApiKeyLogs(tenantId: string) {
    return await prisma.apiKeyLog.count({
      where: { apiKey: { tenantId } },
    });
  }
}
