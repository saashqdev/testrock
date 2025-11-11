import { IEntityViewsDb } from "@/db/interfaces/entityBuilder/IEntityViewsDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { EntityViewsWithTenantAndUserDto, EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import EntityViewModelHelper from "@/lib/helpers/models/EntityViewModelHelper";
import EntityModelHelper from "@/lib/helpers/models/EntityModelHelper";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
export class EntityViewsDbPrisma implements IEntityViewsDb {
  async getAllEntityViews({
    type,
    entityId,
    pagination,
    filters,
  }: {
    type?: string;
    entityId?: string;
    pagination?: { pageSize: number; page: number };
    filters?: FiltersDto;
  }): Promise<{ items: EntityViewsWithTenantAndUserDto[]; total: number }> {
    let where: Prisma.EntityViewWhereInput = {
      entityId,
    };
    if (type === "default") {
      where = { tenantId: null, userId: null, isSystem: false };
    } else if (type === "tenant") {
      where = { tenantId: { not: null }, userId: null, isSystem: false };
    } else if (type === "user") {
      where = { userId: { not: null }, isSystem: false };
    } else if (type === "system") {
      where = { isSystem: true };
    }

    const filterEntityId = filters?.properties.find((filter) => filter.name === "entityId")?.value;
    const filterTenantId = filters?.properties.find((filter) => filter.name === "tenantId")?.value;
    const filterUserId = filters?.properties.find((filter) => filter.name === "userId")?.value;
    if (filterEntityId) {
      where = { ...where, entityId: filterEntityId };
    }
    if (filterTenantId) {
      where = { ...where, tenantId: filterTenantId };
    }
    if (filterUserId) {
      where = { ...where, userId: filterUserId };
    }

    const itemsRaw = await prisma.entityView.findMany({
      take: pagination?.pageSize,
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      where,
      include: {
        ...EntityViewModelHelper.includeDetails,
        entity: { select: EntityModelHelper.selectSimpleProperties },
        createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
      },
      orderBy: [{ tenantId: "asc" }, { userId: "asc" }, { order: "asc" }],
    });

    // Map users to ensure all UserDto fields are present
    const mapUser = (user: any): any =>
      user
        ? {
            ...user,
            admin: user.admin ?? false,
            defaultTenantId: user.defaultTenantId ?? null,
            avatar: user.avatar ?? null,
          }
        : null;

    const items: EntityViewsWithTenantAndUserDto[] = itemsRaw.map((item) => ({
      ...item,
      createdByUser: mapUser(item.createdByUser),
      user: mapUser(item.user),
    }));

    const total = await prisma.entityView.count({ where });
    return {
      items,
      total,
    };
  }

  async getEntityViews(
    entityId: string,
    options?: {
      tenantId?: string | null;
      userId?: string | null;
    }
  ): Promise<EntityViewsWithDetailsDto[]> {
    let where: Prisma.EntityViewWhereInput = {
      entityId,
      isSystem: false,
    };
    if (options?.tenantId !== undefined) {
      where = {
        ...where,
        OR: [
          { tenantId: options.tenantId, userId: options.userId },
          { tenantId: options.tenantId, userId: null },
          { tenantId: null, userId: null },
        ],
      };
    }
    return await prisma.entityView.findMany({
      where,
      include: EntityViewModelHelper.includeDetails,
      orderBy: {
        order: "asc",
      },
    });
  }

  async getEntityView(id: string): Promise<EntityViewsWithDetailsDto | null> {
    return await prisma.entityView.findUnique({
      where: {
        id,
      },
      include: EntityViewModelHelper.includeDetails,
    });
  }

  async getEntityViewWithTenantAndUser(id: string): Promise<EntityViewsWithTenantAndUserDto | null> {
    const mapUser = (user: any): any =>
      user
        ? {
            ...user,
            admin: user.admin ?? false,
            defaultTenantId: user.defaultTenantId ?? null,
            avatar: user.avatar ?? null,
          }
        : null;

    const result = await prisma.entityView.findUnique({
      where: {
        id,
      },
      include: {
        ...EntityViewModelHelper.includeDetails,
        entity: { select: EntityModelHelper.selectSimpleProperties },
        createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        user: { select: UserModelHelper.selectSimpleUserProperties },
      },
    });

    if (!result) return null;

    return {
      ...result,
      createdByUser: mapUser(result.createdByUser),
      user: mapUser(result.user),
    };
  }

  async getEntityViewByName({ entityId, name, isSystem }: { entityId: string; name: string; isSystem?: boolean }): Promise<EntityViewsWithDetailsDto | null> {
    return await prisma.entityView.findFirst({
      where: {
        entityId,
        name,
        isSystem,
      },
      include: EntityViewModelHelper.includeDetails,
    });
  }

  async getEntityViewDefault({ entityId, isSystem }: { entityId: string; isSystem?: boolean }): Promise<EntityViewsWithDetailsDto | null> {
    return await prisma.entityView.findFirst({
      where: {
        entityId,
        isSystem,
        isDefault: true,
      },
      include: EntityViewModelHelper.includeDetails,
    });
  }

  async getEntityViewByOrder(entityId: string, order: number): Promise<EntityViewsWithDetailsDto | null> {
    return await prisma.entityView.findFirst({
      where: {
        entityId,
        order,
      },
      include: EntityViewModelHelper.includeDetails,
    });
  }

  async getMaxEntityViewOrder(entityId: string): Promise<number> {
    return (
      (
        await prisma.entityView.aggregate({
          where: { entityId },
          _max: {
            order: true,
          },
        })
      )._max?.order ?? 0
    );
  }

  async createEntityView(data: {
    entityId: string;
    tenantId: string | null;
    userId: string | null;
    createdByUserId: string;
    layout: string;
    name: string;
    title: string;
    isDefault: boolean;
    isSystem: boolean;
    pageSize: number;
    groupByPropertyId?: string | null;
    gridColumns?: number;
    gridColumnsSm?: number;
    gridColumnsMd?: number;
    gridColumnsLg?: number;
    gridColumnsXl?: number;
    gridColumns2xl?: number;
    gridGap?: string;
    order?: number;
  }) {
    if (!data.order) {
      data.order = (await this.getMaxEntityViewOrder(data.entityId)) + 1;
    }
    return await prisma.entityView.create({
      data: {
        entityId: data.entityId,
        tenantId: data.tenantId,
        userId: data.userId,
        createdByUserId: data.createdByUserId,
        layout: data.layout,
        order: data.order,
        name: data.name,
        title: data.title,
        isDefault: data.isDefault,
        isSystem: data.isSystem,
        pageSize: data.pageSize,
        groupByPropertyId: data.groupByPropertyId,
        gridColumns: data.gridColumns ?? 5,
        gridColumnsSm: data.gridColumnsSm ?? 2,
        gridColumnsMd: data.gridColumnsMd ?? 3,
        gridColumnsLg: data.gridColumnsLg ?? 4,
        gridColumnsXl: data.gridColumnsXl ?? 5,
        gridColumns2xl: data.gridColumns2xl ?? 6,
        gridGap: data.gridGap ?? "sm",
      },
    });
  }

  async updateEntityViewProperties(id: string, items: { propertyId: string | null; name: string; order: number }[]) {
    await prisma.entityViewProperty.deleteMany({
      where: { entityViewId: id },
    });
    return await Promise.all(
      items.map(async (item) => {
        return await prisma.entityViewProperty.create({
          data: {
            entityViewId: id,
            propertyId: item.propertyId,
            name: item.name,
            order: item.order,
          },
        });
      })
    );
  }

  async updateEntityViewFilters(id: string, items: { name: string; condition: string; value: string; match: string }[]) {
    await prisma.entityViewFilter.deleteMany({
      where: { entityViewId: id },
    });
    return await Promise.all(
      items.map(async (item) => {
        return await prisma.entityViewFilter.create({
          data: {
            entityViewId: id,
            name: item.name,
            condition: item.condition,
            value: item.value,
            match: item.match,
          },
        });
      })
    );
  }

  async updateEntityViewSort(id: string, items: { name: string; asc: boolean; order: number }[]) {
    await prisma.entityViewSort.deleteMany({
      where: { entityViewId: id },
    });
    return await Promise.all(
      items.map(async (item) => {
        return await prisma.entityViewSort.create({
          data: {
            entityViewId: id,
            name: item.name,
            asc: item.asc,
            order: item.order,
          },
        });
      })
    );
  }

  async updateEntityView(
    id: string,
    data: {
      layout?: string;
      isDefault?: boolean;
      isSystem?: boolean;
      pageSize?: number;
      name?: string;
      title?: string;
      order?: number;
      groupByPropertyId?: string | null;
      gridColumns?: number;
      gridColumnsSm?: number;
      gridColumnsMd?: number;
      gridColumnsLg?: number;
      gridColumnsXl?: number;
      gridColumns2xl?: number;
      gridGap?: string;
    }
  ) {
    return await prisma.entityView.update({
      where: { id },
      data,
    });
  }

  async deleteEntityView(id: string) {
    return await prisma.entityView.delete({
      where: { id },
    });
  }
}
