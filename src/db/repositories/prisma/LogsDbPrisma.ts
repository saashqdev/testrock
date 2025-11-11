import { ILogsDb } from "@/db/interfaces/logs/ILogsDb";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { prisma } from "@/db/config/prisma/database";
import { Prisma, Log } from "@prisma/client";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { db } from "@/db";
import { getUserInfo } from "@/lib/services/session.server";
import ApiHelper from "@/lib/helpers/ApiHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";

const include = {
  user: true,
  tenant: true,
  apiKey: true,
  comment: {
    include: {
      ...UserModelHelper.includeSimpleCreatedByUser,
      reactions: {
        include: {
          ...UserModelHelper.includeSimpleCreatedByUser,
        },
      },
    },
  },
};

export class LogsDbPrisma implements ILogsDb {
  async getAllLogs(pagination: { page: number; pageSize: number }, filters: FiltersDto): Promise<{ items: LogWithDetailsDto[]; pagination: PaginationDto }> {
    const where = RowFiltersHelper.getFiltersCondition(filters);
    const items = await prisma.log.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      include,
      where,
    });
    const totalItems = await prisma.log.count({
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

  async getLogs(
    tenantId: string,
    pagination: { page: number; pageSize: number },
    filters: FiltersDto
  ): Promise<{ items: LogWithDetailsDto[]; pagination: PaginationDto }> {
    const where = RowFiltersHelper.getFiltersCondition(filters);
    const items = await prisma.log.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where: { tenantId, ...where },
      include,
    });
    const totalItems = await prisma.log.count({
      where: { tenantId, ...where },
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

  async getAllRowLogs({
    entityId,
    rowId,
    tenantId,
    pagination,
  }: {
    entityId?: string;
    rowId?: string;
    tenantId?: string | null;
    pagination: { page: number; pageSize: number };
  }): Promise<{ items: LogWithDetailsDto[]; pagination: PaginationDto }> {
    let where: Prisma.LogWhereInput = { rowId: { not: null } };
    if (entityId) {
      where = { ...where, row: { entityId } };
    }
    if (rowId) {
      where = { ...where, rowId };
    }
    if (tenantId !== undefined) {
      where = { ...where, tenantId };
    }
    const items = await prisma.log.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include,
    });
    const totalItems = await prisma.log.count({
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

  async getRowLogs(tenantId: string | null, rowId: string): Promise<LogWithDetailsDto[]> {
    return await prisma.log.findMany({
      where: {
        tenantId,
        rowId,
      },
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getRowLogsById(rowId: string): Promise<LogWithDetailsDto[]> {
    return await prisma.log.findMany({
      where: {
        rowId,
      },
      include,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createLog(request: Request, tenantId: string | null, action: string, details: string) {
    const userInfo = await getUserInfo();
    await prisma.log.create({
      data: {
        tenantId,
        userId: userInfo.userId,
        url: new URL(request.url).pathname,
        action,
        details,
      },
    });
  }

  async createManualLog(userId: string, tenantId: string | null, pathname: string, action: string, details: string) {
    await prisma.log.create({
      data: {
        tenantId,
        userId,
        url: pathname,
        action,
        details,
      },
    });
  }

  async createRowLog(
    request: Request,
    data: {
      tenantId: string | null;
      createdByUserId?: string | null;
      createdByApiKey?: string | null;
      action: string;
      entity: EntityWithDetailsDto;
      item: RowWithDetailsDto | null;
      commentId?: string | null;
      details?: string;
    }
  ) {
    const log = await prisma.log.create({
      data: {
        tenantId: data.tenantId,
        userId: data.createdByUserId ?? null,
        apiKeyId: data.createdByApiKey ?? null,
        url: new URL(request.url).pathname,
        rowId: data.item?.id ?? null,
        action: data.action,
        details: data.details ?? null,
        commentId: data.commentId ?? null,
      },
    });
    const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
    await db.entityWebhooks.callEntityWebhooks({
      logId: log.id,
      entityId: data.entity.id,
      action: data.action,
      body: apiFormat,
      request,
    });
    return log;
  }

  async createManualRowLog(
    data: {
      tenantId: string | null;
      createdByUserId?: string | null;
      createdByApiKey?: string | null;
      action: string;
      entity: EntityWithDetailsDto;
      item: RowWithDetailsDto | null;
      commentId?: string | null;
    },
    request?: Request
  ) {
    let details = "";
    const log = await prisma.log.create({
      data: {
        tenantId: data.tenantId,
        userId: data.createdByUserId ?? null,
        apiKeyId: data.createdByApiKey ?? null,
        url: request ? new URL(request.url).pathname : "",
        rowId: data.item?.id ?? null,
        action: data.action,
        details,
        commentId: data.commentId ?? null,
      },
    });
    const apiFormat = ApiHelper.getApiFormat(data.entity, data.item);
    await db.entityWebhooks.callEntityWebhooks({
      logId: log.id,
      entityId: data.entity.id,
      action: data.action,
      body: apiFormat,
      // request,
    });
    return log;
  }

  async createLogLogin(request: Request, user: UserWithoutPasswordDto) {
    // eslint-disable-next-line no-console
    // console.log({ clientIpAddress: getClientIPAddress(request.headers) });

    await prisma.log.create({
      data: {
        userId: user.id,
        url: "",
        action: DefaultLogActions.Login,
        details: "",
      },
    });
  }

  async createLogLogout(request: Request, userId: string) {
    await prisma.log.create({
      data: {
        userId,
        url: "",
        action: DefaultLogActions.Logout,
        details: "",
      },
    });
  }

  async createAdminLog(request: Request, action: string, details: string) {
    const userInfo = await getUserInfo();
    await prisma.log.create({
      data: {
        userId: userInfo.userId,
        url: new URL(request.url).pathname,
        action,
        details,
      },
    });
  }

  async getLastUserLog(userId: string): Promise<Log | null> {
    return await prisma.log.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
