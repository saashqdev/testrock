import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { Prisma } from "@prisma/client";
import { MediaDto } from "@/lib/dtos/entities/MediaDto";
import { RowValueMultipleDto } from "@/lib/dtos/entities/RowValueMultipleDto";
import { RowValueRangeDto } from "@/lib/dtos/entities/RowValueRangeDto";
import { RowWithDetailsDto } from "@/db/models";
import { RowFiltersDto } from "@/lib/dtos/data/RowFiltersDto";

export interface IRowsDb {
  getAllRows(entityId: string): Promise<RowWithDetailsDto[]>;
  getRows({
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
    entityId?: string | undefined;
    entityName?: string | undefined;
    tenantId?: string | null | undefined;
    userId?: string | undefined;
    take?: number | undefined;
    skip?: number | undefined;
    orderBy?: Prisma.RowOrderByWithRelationInput[] | undefined;
    filters?: RowFiltersDto;
    ids?: string[];
    rowWhere?: Prisma.RowWhereInput;
    includePublic?: boolean;
  }): Promise<RowWithDetailsDto[]>;
  getRowsBetween(name: string, tenantId: string | null, startDate: Date, endDate: Date): Promise<RowWithDetailsDto[]>;
  getRowsInIds(ids: string[], tenantId?: string | null): Promise<RowWithDetailsDto[]>;
  countRows({
    entityId,
    entityName,
    tenantId,
    userId,
    filters,
    rowWhere,
    includePublic,
  }: {
    entityId?: string | undefined;
    entityName?: string | undefined;
    tenantId?: string | null | undefined;
    userId?: string | undefined;
    filters?: RowFiltersDto | undefined;
    rowWhere?: Prisma.RowWhereInput;
    includePublic?: boolean;
  }): Promise<number>;
  getRow({ entityId, id, tenantId }: { entityId: string; id: string; tenantId?: string | null }): Promise<RowWithDetailsDto | null>;
  getRowById(id: string): Promise<RowWithDetailsDto | null>;
  getMaxRowFolio({
    tenantId,
    entityId,
  }: {
    tenantId: string | null;
    entityId: string;
  }): Promise<Prisma.GetRowAggregateType<{ where: any; _max: { folio: true } }>>;
  getNextRowFolio({ tenantId, entityId }: { tenantId: string | null; entityId: string }): Promise<number>;
  getMaxRowOrder({
    tenantId,
    entityId,
  }: {
    tenantId: string | null;
    entityId: string;
  }): Promise<Prisma.GetRowAggregateType<{ where: any; _max: { order: true } }>>;
  getNextRowOrder({ tenantId, entityId }: { tenantId: string | null; entityId: string }): Promise<number>;
  createRow({
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
      parentRows?: {
        relationshipId: string;
        parentId: string;
      }[];
      childRows?: {
        relationshipId: string;
        childId: string;
      }[];
      rowCreateInput?: Partial<Prisma.RowCreateInput>;
    };
    nextFolio?: number | undefined;
    nextOrder?: number | undefined;
  }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    order: number;
    deletedAt: Date | null;
    folio: number;
    entityId: string;
    tenantId: string | null;
    createdByUserId: string | null;
    createdByApiKeyId: string | null;
  }>;
  updateRow(
    id: string,
    data: {
      properties: any;
      dynamicProperties: {
        propertyId: string;
        id?: string | null | undefined;
        textValue?: string | null | undefined;
        numberValue?: string | number | null | undefined;
        dateValue?: string | Date | null | undefined;
        booleanValue?: boolean | null | undefined;
        media?: MediaDto[] | undefined;
        multiple?: RowValueMultipleDto[];
        range?: RowValueRangeDto | undefined;
      }[];
      parentRows?: {
        relationshipId: string;
        parentId: string;
      }[];
      childRows?: {
        relationshipId: string;
        childId: string;
      }[];
      rowUpdateInput?: Prisma.RowUpdateInput;
    }
  ): Promise<RowWithDetailsDto | null>;
  deleteRow(id: string): Promise<
    {
      values: {
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        textValue: string | null;
        numberValue: Prisma.Decimal | null;
        dateValue: Date | null;
        booleanValue: boolean | null;
        propertyId: string;
        rowId: string;
      }[];
      logs: {
        id: string;
        createdAt: Date;
        tenantId: string | null;
        rowId: string | null;
        userId: string | null;
        apiKeyId: string | null;
        url: string;
        action: string;
        details: string | null;
        commentId: string | null;
      }[];
    } & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      order: number;
      deletedAt: Date | null;
      entityId: string;
      tenantId: string | null;
      folio: number;
      createdByUserId: string | null;
      createdByApiKeyId: string | null;
    }
  >;
  deleteRows(entityId: string): Promise<Prisma.BatchPayload>;
  deleteRowsInIds(ids: string[]): Promise<Prisma.BatchPayload>;
  updateRowMedia(
    id: string,
    data: {
      file?: string;
      publicUrl?: string | null;
      storageBucket?: string | null;
      storageProvider?: string | null;
    }
  ): Promise<void>;
  getAccessFilters({ tenantId, userId }: { tenantId?: string | null; userId?: string }): Promise<Prisma.RowWhereInput>;
}
