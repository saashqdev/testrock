import { IRowsDb } from "@/db/interfaces/entityBuilder/IRowsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { db } from "@/db";
import RowModelHelper from "@/lib/helpers/models/RowModelHelper";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import TenantHelper from "@/lib/helpers/TenantHelper";
import { RowFiltersDto } from "@/lib/dtos/data/RowFiltersDto";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { MediaDto } from "@/lib/dtos/entities/MediaDto";
import { RowValueMultipleDto } from "@/lib/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "@/lib/dtos/entities/RowValueRangeDto";
import { getRowPermissionsCondition } from "@/lib/helpers/server/PermissionsService";
import { storeRowMediaInStorageProvider, deleteRowMediaFromStorageProvider } from "@/lib/helpers/server/MediaService";
export class RowsDbPrisma implements IRowsDb {
  async getAllRows(entityId: string): Promise<RowWithDetailsDto[]> {
    return await prisma.row.findMany({
      where: {
        deletedAt: null,
        entityId,
      },
      include: RowModelHelper.includeRowDetails,
    });
  }

  async getRows({
    entityId,
    entityName,
    tenantId,

    userId,
    take,
    skip,
    orderBy,
    filters,
    ids,
    rowWhere,
    includePublic,
  }: {
    entityId?: string;
    entityName?: string;
    tenantId?: string | null;

    userId?: string;
    take?: number;
    skip?: number;
    orderBy?: Prisma.RowOrderByWithRelationInput[];
    filters?: RowFiltersDto;
    ids?: string[];
    rowWhere?: Prisma.RowWhereInput;
    includePublic?: boolean;
  }): Promise<RowWithDetailsDto[]> {
    const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
    let filterEntity: Prisma.RowWhereInput | undefined = undefined;
    if (entityId) {
      filterEntity = { entityId };
    } else if (entityName) {
      filterEntity = { entity: { name: entityName } };
    }

    const accessFilters = await this.getAccessFilters({ tenantId });
    const where: Prisma.RowWhereInput = {
      AND: [
        { deletedAt: null },
        { ...rowWhere },
        whereFilters,
        { id: { in: ids } },
        { ...filterEntity },
        { ...accessFilters },
        // ...getSearchCondition(filters?.query),
      ],
    };
    return await prisma.row.findMany({
      take,
      skip,
      where,
      include: RowModelHelper.includeRowDetails,
      orderBy,
    });
  }

  async getRowsBetween(name: string, tenantId: string | null, startDate: Date, endDate: Date): Promise<RowWithDetailsDto[]> {
    return await prisma.row.findMany({
      where: {
        AND: [
          { deletedAt: null },
          {
            entity: { name },
            ...TenantHelper.tenantCondition({ tenantId }),
          },
          {
            createdAt: {
              lte: endDate,
              gte: startDate,
            },
          },
        ],
      },
      include: RowModelHelper.includeRowDetails,
      orderBy: { createdAt: "asc" },
    });
  }

  async getRowsInIds(ids: string[], tenantId?: string | null): Promise<RowWithDetailsDto[]> {
    return await prisma.row.findMany({
      where: {
        deletedAt: null,
        id: {
          in: ids,
        },
        tenantId,
      },
      include: RowModelHelper.includeRowDetails,
    });
  }

  async countRows({
    entityId,
    entityName,
    tenantId,

    userId,
    filters,
    rowWhere,
    includePublic,
  }: {
    entityId?: string;
    entityName?: string;
    tenantId?: string | null;

    userId?: string | undefined;
    filters?: RowFiltersDto;
    rowWhere?: Prisma.RowWhereInput;
    includePublic?: boolean;
  }): Promise<number> {
    const whereFilters = RowFiltersHelper.getRowFiltersCondition(filters);
    let filterEntity: { entityId: string } | { entity: { name: string } } | undefined = undefined;
    if (entityId) {
      filterEntity = { entityId };
    } else if (entityName) {
      filterEntity = { entity: { name: entityName } };
    }

    const accessFilters = await this.getAccessFilters({ tenantId });
    const where: Prisma.RowWhereInput = {
      AND: [
        { deletedAt: null },
        { ...rowWhere },
        whereFilters,
        // { id: { in: ids } },
        { ...filterEntity },
        { ...accessFilters },
        // ...getSearchCondition(filters?.query),
      ],
    };
    return await prisma.row.count({
      where,
    });
  }

  async getRow({ entityId, id, tenantId }: { entityId: string; id: string; tenantId?: string | null }): Promise<RowWithDetailsDto | null> {
    const accessFilters = await this.getAccessFilters({ tenantId });
    return await prisma.row.findFirst({
      where: {
        deletedAt: null,
        id,
        entityId,
        ...accessFilters,
      },
      include: {
        ...RowModelHelper.includeRowDetailsNested,
      },
    });
  }

  async getRowById(id: string): Promise<RowWithDetailsDto | null> {
    return await prisma.row.findUnique({
      where: {
        deletedAt: null,
        id,
      },
      include: {
        ...RowModelHelper.includeRowDetailsNested,
      },
    });
  }

  async getMaxRowFolio({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
    let where: any = { tenantId, entityId };
    return await prisma.row.aggregate({
      where,
      _max: {
        folio: true,
      },
    });
  }

  async getNextRowFolio({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
    const maxFolio = await this.getMaxRowFolio({ tenantId, entityId });
    let next = 1;
    if (maxFolio && maxFolio._max.folio !== null) {
      next = maxFolio._max.folio + 1;
    }
    return next;
  }

  async getMaxRowOrder({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
    let where: any = { tenantId, entityId };
    return await prisma.row.aggregate({
      where,
      _max: {
        order: true,
      },
    });
  }

  async getNextRowOrder({ tenantId, entityId }: { tenantId: string | null; entityId: string }) {
    const maxOrder = await this.getMaxRowOrder({ tenantId, entityId });
    let next = 1;
    if (maxOrder && maxOrder._max.order !== null) {
      next = maxOrder._max.order + 1;
    }
    return next;
  }

  async createRow({
    entity,
    data,
    nextFolio,
    nextOrder,
  }: {
    entity: EntityWithDetailsDto;
    data: {
      tenantId: string | null;

      createdByUserId?: string | null;
      createdByApiKeyId?: string | null;
      properties: any;
      dynamicProperties?: {
        propertyId: string;
        id?: string | null;
        textValue?: string | null;
        numberValue?: number | string | null;
        dateValue?: Date | string | null;
        booleanValue?: boolean | null;
        media?: MediaDto[];
        multiple?: RowValueMultipleDto[];
        range?: RowValueRangeDto;
      }[];
      parentRows?: { relationshipId: string; parentId: string }[];
      childRows?: { relationshipId: string; childId: string }[];
      rowCreateInput?: Partial<Prisma.RowCreateInput>;
    };
    nextFolio?: number | undefined;
    nextOrder?: number | undefined;
  }) {
    let folio = nextFolio ?? 1;
    if (!nextFolio) {
      const maxFolio = await this.getMaxRowFolio({ tenantId: data.tenantId, entityId: entity.id });
      if (maxFolio && maxFolio._max.folio !== null) {
        folio = maxFolio._max.folio + 1;
      }
    }

    let order = nextOrder ?? 1;
    if (!nextOrder) {
      const maxOrder = await this.getMaxRowOrder({ tenantId: data.tenantId, entityId: entity.id });
      if (maxOrder && maxOrder._max.order !== null) {
        order = maxOrder._max.order + 1;
      }
    }

    const createInput: Prisma.XOR<Prisma.RowCreateInput, Prisma.RowUncheckedCreateInput> = {
      folio,
      order,
      entityId: entity.id,
      tenantId: data.tenantId,
      createdByUserId: data.createdByUserId ?? null,
      createdByApiKeyId: data.createdByApiKeyId ?? null,
      ...data.properties,
      values: {
        create: data.dynamicProperties
          // .filter((f) => !f.id)
          ?.map((value) => {
            return {
              propertyId: value.propertyId,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
              booleanValue: value.booleanValue,
              media: {
                create: value.media?.map((m) => {
                  return {
                    name: m.name,
                    title: m.title,
                    type: m.type,
                    file: m.file,
                    publicUrl: m.publicUrl,
                  };
                }),
              },
              multiple: {
                create: value.multiple?.map((m) => {
                  return {
                    order: m.order,
                    value: m.value,
                  };
                }),
              },
              range: {
                create: {
                  numberMin: value.range?.numberMin,
                  numberMax: value.range?.numberMax,
                  dateMin: value.range?.dateMin,
                  dateMax: value.range?.dateMax,
                },
              },
            };
          }),
      },
      parentRows: {
        create: data.parentRows?.map(({ relationshipId, parentId }) => {
          return {
            relationshipId,
            parentId,
          };
        }),
      },
      childRows: {
        create: data.childRows?.map(({ relationshipId, childId }) => {
          return {
            relationshipId,
            childId,
          };
        }),
      },
      ...data.rowCreateInput,
    };
    const row = await prisma.row.create({
      data: createInput,
    });

    return row;
  }

  async updateRow(
    id: string,
    data: {
      properties: any;
      dynamicProperties: {
        propertyId: string;
        id?: string | null;
        textValue?: string | null;
        numberValue?: number | string | null;
        dateValue?: Date | string | null;
        booleanValue?: boolean | null;
        media?: MediaDto[];
        multiple?: RowValueMultipleDto[];
        range?: RowValueRangeDto | undefined;
      }[];
      parentRows?: { relationshipId: string; parentId: string }[];
      childRows?: { relationshipId: string; childId: string }[];
      rowUpdateInput?: Prisma.RowUpdateInput;
    }
  ) {
    let row = await this.getRowById(id);
    // await deleteRowMediaFromStorageProvider(row);

    if (data.parentRows) {
      const { count } = await prisma.rowRelationship.deleteMany({
        where: { childId: id },
      });
      // eslint-disable-next-line no-console
      console.log("Deleted parent rows: " + count);
    }
    if (data.childRows) {
      const { count } = await prisma.rowRelationship.deleteMany({
        where: { parentId: id },
      });
      // eslint-disable-next-line no-console
      console.log("Deleted child rows: " + count);
    }

    await prisma.rowMedia.deleteMany({
      where: {
        rowValue: {
          rowId: id,
          propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
        },
      },
    });
    await prisma.rowValueMultiple.deleteMany({
      where: {
        rowValue: {
          rowId: id,
          propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
        },
      },
    });
    await prisma.rowValueRange.deleteMany({
      where: {
        rowValue: {
          rowId: id,
          propertyId: { in: data.dynamicProperties.map((p) => p.propertyId) },
        },
      },
    });
    // eslint-disable-next-line no-console
    // console.log("Deleted media values: " + deletedMedia.count);

    const update: Prisma.RowUpdateInput = {
      ...data.properties,
      values: {
        create: data.dynamicProperties
          .filter((f) => !f.id)
          .map((value) => {
            return {
              propertyId: value.propertyId,
              textValue: value.textValue,
              numberValue: value.numberValue,
              dateValue: value.dateValue,
              booleanValue: value.booleanValue,
              media: {
                create: value.media?.map((m) => {
                  return {
                    name: m.name,
                    title: m.title,
                    type: m.type,
                    file: m.file,
                    publicUrl: m.publicUrl,
                  };
                }),
              },
              multiple: {
                create: value.multiple?.map((m) => {
                  return {
                    order: m.order,
                    value: m.value,
                  };
                }),
              },
              range: {
                create: {
                  numberMin: value.range?.numberMin,
                  numberMax: value.range?.numberMax,
                  dateMin: value.range?.dateMin,
                  dateMax: value.range?.dateMax,
                },
              },
            };
          }),
        update: data.dynamicProperties
          .filter((f) => f.id)
          .map((value) => {
            return {
              where: { id: value.id },
              data: {
                textValue: value.textValue,
                numberValue: value.numberValue,
                dateValue: value.dateValue,
                booleanValue: value.booleanValue,
                media: {
                  create: value.media?.map((m) => {
                    return {
                      name: m.name,
                      title: m.title,
                      type: m.type,
                      file: m.file,
                      publicUrl: m.publicUrl,
                    };
                  }),
                },
                multiple: {
                  create: value.multiple?.map((m) => {
                    return {
                      order: m.order,
                      value: m.value,
                    };
                  }),
                },
                range: {
                  create: {
                    numberMin: value.range?.numberMin,
                    numberMax: value.range?.numberMax,
                    dateMin: value.range?.dateMin,
                    dateMax: value.range?.dateMax,
                  },
                },
              },
            };
          }),
      },
      parentRows: {
        create: data.parentRows?.map(({ relationshipId, parentId }) => {
          return {
            relationshipId,
            parentId,
          };
        }),
      },
      childRows: {
        create: data.childRows?.map(({ relationshipId, childId }) => {
          return {
            relationshipId,
            childId,
          };
        }),
      },
      ...data.rowUpdateInput,
    };
    await prisma.row.update({
      where: {
        id,
      },
      data: update,
    });

    row = await this.getRowById(id);
    if (row) {
      const entity = await db.entities.getEntityById({ tenantId: row.tenantId, id: row.entityId });
      if (entity && row) {
        await storeRowMediaInStorageProvider(entity, row);
      }
    }

    return row!;
  }

  async deleteRow(id: string) {
    const row = await this.getRowById(id);
    await deleteRowMediaFromStorageProvider(row);
    return await prisma.row.delete({
      where: { id },
      include: {
        logs: true,
        values: true,
      },
    });
  }

  async deleteRows(entityId: string) {
    return await prisma.row.deleteMany({
      where: { entityId },
    });
  }

  async deleteRowsInIds(ids: string[]) {
    return await prisma.row.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async updateRowMedia(
    id: string,
    data: {
      file?: string;
      publicUrl?: string | null;
      storageBucket?: string | null;
      storageProvider?: string | null;
    }
  ) {
    await prisma.rowMedia.update({
      where: { id },
      data,
    });
  }

  async getAccessFilters({ tenantId, userId }: { tenantId?: string | null; userId?: string }) {
    let tenantFilters: Prisma.RowWhereInput | undefined = undefined;
    let userPermissionFilters: Prisma.RowWhereInput | undefined = undefined;
    if (tenantId !== undefined) {
      tenantFilters = TenantHelper.tenantCondition({ tenantId });
    }
    if (userId) {
      userPermissionFilters = await getRowPermissionsCondition({ tenantId, userId });
    }
    const filters: Prisma.RowWhereInput = {
      AND: [{ ...tenantFilters }, { ...userPermissionFilters }],
    };
    return filters;
  }
}
