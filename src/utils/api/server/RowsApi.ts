import { EntityTag, Prisma, Row, RowPermission } from "@prisma/client";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { RowCommentWithDetailsDto } from "@/db/models/entityBuilder/RowCommentsModel";
import { RowTagWithDetailsDto } from "@/db/models/entityBuilder/RowTagsModel";
import { RowTaskWithDetailsDto } from "@/db/models/entityBuilder/RowTasksModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getEntityPermission } from "@/lib/helpers/PermissionsHelper";
import { getUserPermission, getUserRowPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl, getEntityFiltersFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getRowsWithPagination } from "@/lib/helpers/server/RowPaginationService";
import * as Constants from "@/lib/constants";
import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { RowValueDto } from "@/lib/dtos/entities/RowValueDto";
import { RowPermissionsDto } from "@/lib/dtos/entities/RowPermissionsDto";
import { Colors } from "@/lib/enums/shared/Colors";
import { getPlanFeatureUsage, reportUsage } from "@/utils/services/server/subscriptionService";
import { TFunction } from "i18next";
import RowHelper from "@/lib/helpers/RowHelper";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import { promiseHash } from "../../promises/promiseHash";
import { TimeFunction, timeFake } from "@/modules/metrics/services/server/MetricTracker";
import RelationshipHelper from "@/lib/helpers/RelationshipHelper";
import { onBeforeGetAll, onAfterGetAll, onBeforeGet, onAfterGet, onBeforeCreate, onAfterCreate, onBeforeUpdate, onAfterUpdate, onBeforeDelete, onAfterDelete } from "@/hooks/RowHooks";
import { DefaultVisibility } from "@/lib/dtos/shared/DefaultVisibility";
import { storeRowMediaInStorageProvider } from "@/lib/helpers/server/MediaService";
import { shareWithDefault } from "./RowPermissionsApi";
import { getRowUserOrApiKey } from "@/lib/helpers/RowEventsHelper";
import EventsService from "@/modules/events/services/server/EventsService";
import { RowDto } from "@/modules/rows/repositories/RowDto";
import { RowCreatedDto } from "@/modules/events/dtos/RowCreatedDto";
import ApiHelper from "@/lib/helpers/ApiHelper";
import { getCurrentEntityView } from "./EntityViewsApi";
import { DefaultAppRoles } from "@/lib/dtos/shared/DefaultAppRoles";
import { fillSystemProperties } from "./EntitiesApi";

export type GetRowsData = {
  results: number;
  entity: EntityWithDetailsDto;
  items: RowWithDetailsDto[];
  tags: EntityTag[];
  pagination: PaginationDto;
  views: EntityViewsWithDetailsDto[];
  currentView: EntityViewsWithDetailsDto | null;
  filterableProperties?: FilterablePropertyDto[];
  allPromptFlows: PromptFlowWithDetailsDto[];
  promptFlows: PromptFlowWithDetailsDto[];
  counts: { [key: string]: number };
};
export async function getAll({
  entity,
  tenantId,
  userId,
  urlSearchParams,
  pageSize,
  includePublic,
  entityView,
  rowWhere,
  time,
}: {
  entity: { id?: string; name?: string };
  tenantId?: string | null;
  userId?: string;
  urlSearchParams?: URLSearchParams;
  pageSize?: number;
  includePublic?: boolean;
  entityView?: EntityViewsWithDetailsDto;
  rowWhere?: Prisma.RowWhereInput;
  time?: TimeFunction;
}): Promise<GetRowsData> {
  if (!time) {
    time = timeFake;
  }
  if (!urlSearchParams) {
    urlSearchParams = new URLSearchParams();
  }
  const rowEntity: EntityWithDetailsDto | undefined = await time(
    db.entities.getEntityByIdOrName({ tenantId, ...entity }),
    "RowsApi.getAll.1.getEntityByIdOrName"
  );
  if (!rowEntity) {
    throw Error("Entity not found: " + rowEntity);
  }
  await onBeforeGetAll({ entity: rowEntity, tenantId, userId, urlSearchParams });
  await time(validateEntityPermission({ userId, entity: rowEntity, tenantId, name: "view" }), "RowsApi.getAll.2.validateEntityPermission");
  const views = await time(
    db.entityViews.getEntityViews(rowEntity.id, {
      tenantId,
      userId,
    }),
    "RowsApi.getAll.3.getEntityViews"
  );
  let currentView = entityView ?? (await time(getCurrentEntityView(rowEntity.id, urlSearchParams), "RowsApi.getAll.4.getCurrentEntityView"));

  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filters = getEntityFiltersFromCurrentUrl(true, rowEntity, urlSearchParams, currentView);
  if (!pageSize) {
    pageSize = Constants.DEFAULT_PAGE_SIZE;
    const urlPageSize = Number(urlSearchParams.get("pageSize"));
    if (currentView && currentView?.pageSize > 0) {
      pageSize = currentView.pageSize;
    }
    if (urlPageSize !== 0) {
      pageSize = urlPageSize;
    }
  }
  const { items, pagination } = await getRowsWithPagination({
    entityId: entity.id,
    entityName: entity.name,
    tenantId,
    userId,
    pageSize,
    page: currentPagination.page,
    sortedBy: currentPagination.sortedBy,
    filters,
    includePublic,
    rowWhere,
  });

  const { tags, allPromptFlows } = await time(
    promiseHash({
      tags: db.entityTags.getEntityTags(rowEntity.id),
      allPromptFlows: db.promptFlows.getPromptFlows(),
    }),
    "RowsApi.getAll.5.details"
  );
  await onAfterGetAll({ entity: rowEntity, tenantId, userId, urlSearchParams, items, pagination });

  const promptFlows = allPromptFlows.filter((f) => f.inputEntityId === rowEntity!.id || f.outputs.find((o) => o.entityId === rowEntity!.id));
  let counts: { [key: string]: number } = {};
  items.forEach((item) => cleanDuplicatedNestedRows(item));
  const data: GetRowsData = {
    results: items.length,
    entity: rowEntity,
    pagination,
    items,
    tags,
    views,
    currentView,
    // filterableProperties,
    allPromptFlows,
    promptFlows,
    counts,
  };
  return data;
}

export type GetRowData = {
  entity: EntityWithDetailsDto;
  item: RowWithDetailsDto;
  logs: LogWithDetailsDto[];
  comments: RowCommentWithDetailsDto[];
  tasks: RowTaskWithDetailsDto[];
  tags: RowTagWithDetailsDto[];
  permissions: RowPermission[];
  rowPermissions: RowPermissionsDto;
  allPromptFlows: PromptFlowWithDetailsDto[];
  promptFlows: PromptFlowWithDetailsDto[];
};
export async function get(
  id: string,
  {
    entity,
    tenantId,
    userId,
    time,
  }: {
    entity: { id?: string; name?: string } | EntityWithDetailsDto;
    tenantId?: string | null;
    userId?: string;
    time?: TimeFunction;
  }
): Promise<GetRowData> {
  if (!time) {
    time = timeFake;
  }
  let rowEntity: EntityWithDetailsDto | undefined;
  // if entity is not type of EntityWithDetails, then get it from id or name
  if (!entity.id || !entity.name) {
    rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.get.getEntityByIdOrName");
  } else {
    rowEntity = entity as EntityWithDetailsDto;
  }
  if (!rowEntity) {
    throw Error("Entity not found: " + rowEntity);
  }
  await onBeforeGet({ id, entity: rowEntity, tenantId, userId });
  await time(validateEntityPermission({ userId, entity: rowEntity, tenantId, name: "read" }), "RowsApi.get.validateEntityPermission");
  const item = await time(db.rows.getRow({ entityId: rowEntity.id, id, tenantId }), "RowsApi.get.getRow");
  if (!item) {
    const existing = await time(db.rows.getRowById(id), "RowsApi.get.getRowById");
    if (!existing) {
      throw Error(`${rowEntity.name} not found: ${id}`);
    }
    if (existing?.entityId !== entity.id) {
      throw Error(`Row exists, but not in entity ${entity.name}`);
    } else if (tenantId !== undefined && existing?.tenantId !== tenantId) {
      throw Error(`Row exists, but not in tenant ${tenantId}`);
    }
    throw Error("Not found");
  }
  const rowPermissions = await time(getUserRowPermission(item, tenantId, userId), "RowsApi.get.getUserRowPermission");
  if (!rowPermissions.canRead) {
    throw Response.json({ error: "You don't have access to this row" }, { status: 403 });
  }
  const { logs, tags, comments, tasks, permissions, allPromptFlows } = await time(
    promiseHash({
      logs: db.logs.getRowLogs(item.tenantId, item.id),
      tags: db.rowTags.getRowTags(item.id),
      comments: db.rowComments.getRowComments(item.id),
      tasks: db.rowTasks.getRowTasks(item.id),
      permissions: db.rowPermissions.getRowPermissions(item.id),
      allPromptFlows: db.promptFlows.getPromptFlows({ isPublic: true }),
    }),
    "RowsApi.get.details"
  );
  await onAfterGet({ id, entity: rowEntity, tenantId, userId, item });
  const promptFlows = allPromptFlows.filter((f) => f.inputEntityId === rowEntity!.id || f.outputs.find((o) => o.entityId === rowEntity!.id));
  cleanDuplicatedNestedRows(item);

  await fillSystemProperties({ entity: rowEntity, tenantId, userId });
  const data: GetRowData = {
    item,
    entity: rowEntity,
    logs,
    tags,
    comments,
    tasks,
    permissions,
    rowPermissions,
    allPromptFlows,
    promptFlows,
  };
  return data;
}

export type GetRelationshipRowsData = {
  relationship: EntityRelationshipWithDetailsDto;
  rows: RowWithDetailsDto[];
}[];
export async function getRelationshipRows({
  entity,
  tenantId,
  userId,
  time,
}: {
  entity: EntityWithDetailsDto;
  tenantId: string | null;
  userId?: string;
  time?: TimeFunction;
}) {
  if (!time) {
    time = timeFake;
  }
  const relationshipRows: GetRelationshipRowsData = [];
  await time(
    Promise.all(
      entity.parentEntities
        .filter((relationship) => RelationshipHelper.getInputType({ fromEntityId: entity.id, relationship }) === "single-select")
        .map((parent) =>
          RowsApi.getAll({ entity: { id: parent.parentId }, tenantId, userId, urlSearchParams: new URLSearchParams(), pageSize: 100 }).then((rowsData) => {
            relationshipRows.push({ relationship: parent, rows: rowsData.items });
          })
        )
    ),
    "RowsApi.getRelationshipRows.getParentEntities"
  );

  await time(
    Promise.all(
      entity.childEntities
        .filter((relationship) => RelationshipHelper.getInputType({ fromEntityId: entity.id, relationship }) === "single-select")
        .map(async (child) => {
          const rowsData = await RowsApi.getAll({
            entity: { id: child.childId },
            tenantId,
            userId,
            urlSearchParams: new URLSearchParams(),
            pageSize: 100,
          });
          relationshipRows.push({ relationship: child, rows: rowsData.items });
        })
    ),
    "RowsApi.getRelationshipRows.getChildEntities"
  );

  return relationshipRows;
}

export type CreateRowActionData = RowWithDetailsDto;
type CreateRowInput = {
  entity: { id?: string; name?: string } | EntityWithDetailsDto;
  tenantId: string | null;
  userId?: string;
  rowValues?: {
    dynamicProperties: RowValueDto[];
    properties?: any;
    parentRows?: { relationshipId: string; parentId: string }[];
    childRows?: { relationshipId: string; childId: string }[];
  };
  rowCreateInput?: Partial<Prisma.RowCreateInput>;
  nextFolio?: number;
  nextOrder?: number;
  options?: {
    checkUsage: boolean;
    createLog: boolean;
    createEvent: boolean;
    storeMedia: boolean;
    reportUsage: boolean;
  };
};
export async function create({
  entity,
  tenantId,
  userId,
  rowValues,
  rowCreateInput,
  nextOrder,
  nextFolio,
  time,
  options,
  request,
}: CreateRowInput & {
  time?: TimeFunction;
  request?: Request;
}): Promise<CreateRowActionData> {
  if (!time) {
    time = timeFake;
  }
  let rowEntity: EntityWithDetailsDto | undefined;
  if (!entity.id || !entity.name) {
    rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.get.getEntityByIdOrName");
  } else {
    rowEntity = entity as EntityWithDetailsDto;
  }
  if (options?.checkUsage === undefined || options?.checkUsage) {
    if (tenantId) {
      const usage = await time(getPlanFeatureUsage(tenantId, rowEntity.name), "RowsApi.create.getPlanFeatureUsage");
      if (usage && !usage.enabled) {
        throw Error(usage.message);
      }
    }
  }
  await onBeforeCreate({ entity: rowEntity, tenantId, userId, rowValues });
  const item = await time(
    db.rows.createRow({
      entity: rowEntity,
      data: {
        tenantId,
        createdByUserId: userId,
        dynamicProperties: rowValues?.dynamicProperties,
        properties: rowValues?.properties,
        parentRows: rowValues?.parentRows,
        childRows: rowValues?.childRows,
        rowCreateInput,
      },
      nextFolio,
      nextOrder,
    }),
    "RowsApi.create.createRow"
  );

  const createdRow = await db.rows.getRowById(item.id);
  if (!createdRow) {
    throw Error("Row not found");
  }

  if (request && (options?.createEvent === undefined || options?.createEvent === true)) {
    await EventsService.create({
      request,
      event: "row.created",
      tenantId,
      userId: userId ?? null,
      data: {
        id: createdRow.id,
        title: RowHelper.getTextDescription({ entity: rowEntity, item: createdRow }),
        row: ApiHelper.getApiFormat(rowEntity, createdRow),
        entity: { id: rowEntity.id, name: rowEntity.name, slug: rowEntity.slug, title: rowEntity.title },
        visibility: "",
        ...(await getRowUserOrApiKey({ userId: createdRow.createdByUserId, apiKeyId: createdRow.createdByApiKeyId })),
        // permissions: getRowPermissionsObjects(permissions),
      } satisfies RowCreatedDto,
    });
  }

  if (entity && createdRow) {
    if (options?.storeMedia === undefined || options?.storeMedia === true) {
      await storeRowMediaInStorageProvider(rowEntity, createdRow);
    }
    if (options?.reportUsage === undefined || options?.reportUsage === true) {
      if (tenantId) {
        await reportUsage(tenantId, rowEntity.name);
      }
    }
    await shareWithDefault(createdRow, rowEntity.defaultVisibility as DefaultVisibility);
  }

  if (options?.createLog === undefined || options?.createLog) {
    await time(
      db.logs.createManualRowLog({ tenantId, createdByUserId: userId, action: DefaultLogActions.Created, entity: rowEntity, item: createdRow }),
      "RowsApi.create.createManualRowLog"
    );
  }
  await onAfterCreate({ entity: rowEntity, tenantId, userId, item: createdRow, rowValues });

  return createdRow;
}

export async function createSimple({
  entity,
  tenantId,
  userId,
  rowValues,
  rowCreateInput,
  nextOrder,
  nextFolio,
  time,
}: CreateRowInput & {
  time?: TimeFunction;
}) {
  if (!time) {
    time = timeFake;
  }
  let rowEntity: EntityWithDetailsDto | undefined;
  if (!entity.id || !entity.name) {
    rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.get.getEntityByIdOrName");
  } else {
    rowEntity = entity as EntityWithDetailsDto;
  }
  const item = await time(
    db.rows.createRow({
      entity: rowEntity,
      data: {
        tenantId,
        createdByUserId: userId,
        dynamicProperties: rowValues?.dynamicProperties,
        properties: rowValues?.properties,
        parentRows: rowValues?.parentRows,
        childRows: rowValues?.childRows,
        rowCreateInput,
      },
      nextFolio,
      nextOrder,
    }),
    "RowsApi.create.createRow"
  );

  await shareWithDefault(item, rowEntity.defaultVisibility as DefaultVisibility);

  return item;
}

export type EditRowData = RowWithDetailsDto;
export async function update(
  id: string,
  {
    entity,
    tenantId,
    userId,
    rowValues,
    rowUpdateInput,
    checkPermissions = true,
    time,
    options,
  }: {
    entity: { id?: string; name?: string } | EntityWithDetailsDto;
    tenantId: string | null;
    userId?: string;
    rowValues: {
      dynamicProperties: RowValueDto[];
      properties?: any;
      parentRows?: { relationshipId: string; parentId: string }[];
      childRows?: { relationshipId: string; childId: string }[];
    };
    rowUpdateInput?: Prisma.RowUpdateInput;
    checkPermissions?: boolean;
    time?: TimeFunction;
    options?: {
      checkUsage?: boolean;
      createLog?: boolean;
    };
  }
): Promise<CreateRowActionData> {
  if (!time) {
    time = timeFake;
  }
  const rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.update.getEntityByIdOrName");
  const row = await time(db.rows.getRowById(id), "RowsApi.update.getRowById");
  if (checkPermissions) {
    const { permissions } = await time(
      promiseHash({
        permissions: getUserRowPermission(row!, tenantId, userId),
        entityPermission: validateEntityPermission({ userId, entity: rowEntity, tenantId, name: "update" }),
      }),
      "RowsApi.update.permissions"
    );

    if (userId !== undefined && !permissions.canUpdate) {
      throw Error("You don't have access to update this row");
    }
  }
  await onBeforeUpdate({ id, item: row!, entity: rowEntity, tenantId, userId, rowValues });
  const item = await time(
    db.rows.updateRow(id, {
      dynamicProperties: rowValues.dynamicProperties,
      properties: rowValues.properties,
      parentRows: rowValues.parentRows,
      childRows: rowValues.childRows,
      rowUpdateInput,
    }),
    "RowsApi.update.updateRow"
  );
  // await FormulaService.trigger({ trigger: "ON_UPDATE", rows: item ? [item] : [], entity: rowEntity, session: { tenantId, userId } });
  if (options?.createLog === undefined || options?.createLog) {
    await time(
      db.logs.createManualRowLog({ tenantId, createdByUserId: userId, action: DefaultLogActions.Updated, entity: rowEntity, item }),
      "RowsApi.update.createManualRowLog"
    );
  }
  if (!item) {
    throw new Error("Row not found after update");
  }
  await onAfterUpdate({ id, entity: rowEntity, tenantId, userId, rowValues, item });
  return item;
}

export async function del(
  id: string,
  {
    entity,
    tenantId,
    userId,
    checkPermissions = true,
    time,
  }: {
    entity: { id?: string; name?: string };
    tenantId?: string | null;
    userId?: string;
    checkPermissions?: boolean;
    time?: TimeFunction;
  }
) {
  if (!time) {
    time = timeFake;
  }
  const rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.del.getEntityByIdOrName");
  const row = await time(db.rows.getRowById(id), "RowsApi.del.getRowById");
  if (!row) {
    throw Error("Row not found");
  }
  await onBeforeDelete({ id, item: row, entity: rowEntity, tenantId: row.tenantId ?? null, userId });
  if (checkPermissions) {
    const { permissions } = await time(
      promiseHash({
        permissions: getUserRowPermission(row!, tenantId, userId),
        entityPermission: validateEntityPermission({ userId, entity: rowEntity, tenantId, name: "delete" }),
      }),
      "RowsApi.del.permissions"
    );
    if (!permissions.canDelete) {
      if (!tenantId || !userId) {
        throw Error("You don't have access to delete this row");
      } else {
        const isSuperUser = await db.userRoles.getUserRoleInTenant(userId, tenantId, DefaultAppRoles.SuperUser);
        if (!isSuperUser) {
          throw Error("You don't have access to delete this row");
        } else {
          console.log(`Current user is SuperUser. Bypassing delete permission check.`);
        }
      }
    }
  }
  if (row) {
    for (const child of row.childRows) {
      const relationship = rowEntity.childEntities.find((f) => f.id === child.relationshipId);
      if (relationship?.cascade) {
        await time(del(child.childId, { entity: { id: relationship.childId }, tenantId, userId, checkPermissions }), "RowsApi.del.childRows");
      }
    }
  }
  await time(
    db.logs.createManualRowLog({ tenantId: row?.tenantId ?? null, createdByUserId: userId, action: DefaultLogActions.Deleted, entity: rowEntity, item: row }),
    "RowsApi.del.createManualRowLog"
  );
  const deleted = await db.rows.deleteRow(id);
  await onAfterDelete({ id, entity: rowEntity, tenantId: row.tenantId ?? null, userId, item: row });
  return deleted;
}

export async function count({
  entity,
  tenantId,
  userId,
  rowWhere,
  includePublic,
  time,
}: {
  entity: { id?: string; name?: string };
  tenantId: string | null | undefined;
  userId?: string;
  rowWhere?: Prisma.RowWhereInput;
  includePublic?: boolean;
  time?: TimeFunction;
}): Promise<number> {
  if (!time) {
    time = timeFake;
  }
  const rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.count.getEntityByIdOrName");
  if (!rowEntity) {
    throw Error("Entity not found");
  }
  return await time(db.rows.countRows({ entityId: rowEntity.id, tenantId, userId, rowWhere, includePublic }), "RowsApi.count.countRows");
}

export async function getTasks({ completed, assignedOrCreatedUserId, time }: { completed?: boolean; assignedOrCreatedUserId?: string; time?: TimeFunction }) {
  if (!time) {
    time = timeFake;
  }
  return await time(db.rowTasks.getAllRowTasks({ completed, assignedOrCreatedUserId }), "RowsApi.getTasks.getAllRowTasks");
}

export async function find({
  entity,
  tenantId,
  properties,
  time,
}: {
  entity: { id?: string; name?: string };
  tenantId?: string | null;
  properties: { name: string; value: string | null }[];
  time?: TimeFunction;
}) {
  if (!time) {
    time = timeFake;
  }
  const rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.find.getEntityByIdOrName");
  if (!rowEntity) {
    throw Error("Entity not found");
  }
  const rows = await time(
    db.rows.getRows({
      entityId: entity.id,
      entityName: entity.name,
      tenantId,
      filters: {
        customRow: false,
        entity: rowEntity,
        query: null,
        tags: [],
        properties: properties.map((f) => {
          return {
            property: rowEntity.properties.find((p) => p.name === f.name),
            value: f.value,
            condition: "equals",
          };
        }),
      },
    }),
    "RowsApi.find.getRows"
  );

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

export async function findMany({
  entity,
  tenantId,
  properties,
  time,
}: {
  entity: { id?: string; name?: string };
  tenantId?: string | null;
  properties: { name: string; value: string | null }[];
  time?: TimeFunction;
}) {
  if (!time) {
    time = timeFake;
  }
  const rowEntity = await time(db.entities.getEntityByIdOrName({ tenantId, ...entity }), "RowsApi.findMany.getEntityByIdOrName");
  if (!rowEntity) {
    throw Error("Entity not found");
  }
  const rows = await time(
    db.rows.getRows({
      entityId: entity.id,
      entityName: entity.name,
      tenantId,
      filters: {
        customRow: false,
        entity: rowEntity,
        query: null,
        tags: [],
        properties: properties.map((f) => {
          return {
            property: rowEntity.properties.find((p) => p.name === f.name),
            value: f.value,
            condition: "equals",
            match: "or",
          };
        }),
      },
    }),
    "RowsApi.findMany.getRows"
  );

  return rows;
}

export async function addTag({ row, tag, time }: { row: Row; tag: { value: string; color?: Colors }; time?: TimeFunction }) {
  if (!time) {
    time = timeFake;
  }
  let existingTag = await time(db.entityTags.getEntityTag(row.entityId, tag.value), "RowsApi.addTag.getEntityTag");
  if (!existingTag) {
    existingTag = await time(
      db.entityTags.createEntityTag({
        entityId: row.entityId,
        value: tag.value,
        color: tag.color ?? Colors.GRAY,
      }),
      "RowsApi.addTag.createEntityTag"
    );
  }
  return await time(
    db.rowTags.createRowTag({
      rowId: row.id,
      tagId: existingTag.id,
    }),
    "RowsApi.addTag.createRowTag"
  );
}

export async function removeTag({ row, tag, time }: { row: Row; tag: string; time?: TimeFunction }) {
  if (!time) {
    time = timeFake;
  }
  const entityTag = await time(db.entityTags.getEntityTag(row.entityId, tag), "RowsApi.removeTag.getEntityTag");
  if (entityTag) {
    const rowTag = await time(db.rowTags.getRowTagByIds(row.id, entityTag.id), "RowsApi.removeTag.getRowTagByIds");
    if (rowTag) {
      return await time(db.rowTags.deleteRowTag(rowTag.id), "RowsApi.removeTag.deleteRowTag");
    }
  }
}

async function validateEntityPermission({
  userId,
  entity,
  tenantId,
  name,
}: {
  entity: { name: string };
  name: "view" | "read" | "create" | "update" | "delete";
  userId?: string;
  tenantId?: string | null;
}) {
  if (userId && tenantId) {
    const permissionName = getEntityPermission(entity, name);
    const { permission, userPermission } = await getUserPermission({ userId, permissionName, tenantId });
    if (permission && !userPermission) {
    }
  }
}
export async function createCustom({
  request,
  entity,
  t,
  form,
  row,
  tenantId,
  userId,
  rowCreateInput,
  time,
}: {
  entity: EntityWithDetailsDto;
  tenantId: string | null;
  userId?: string;
  t: TFunction;
  form: FormData;
  row: RowWithDetailsDto | undefined;
  rowCreateInput?: Partial<Prisma.RowCreateInput> | undefined;
  time?: TimeFunction;
  request: Request;
}) {
  if (!time) {
    time = timeFake;
  }
  const rowValues = RowHelper.getRowPropertiesFromForm({ t, entity, form, existing: row });
  if (!row) {
    await time(
      RowsApi.create({
        entity,
        tenantId,
        userId,
        rowValues,
        rowCreateInput,
        request,
      }),
      "RowsApi.createCustom.create"
    );
  } else {
    await time(
      RowsApi.update(row.id, {
        entity,
        tenantId,
        rowValues,
      }),
      "RowsApi.createCustom.update"
    );
  }
}
export async function changeOrder(
  id: string,
  {
    target,
    time,
  }: {
    target: "up" | "down";
    time?: TimeFunction;
  }
) {
  if (!time) {
    time = timeFake;
  }
  const row = await time(db.rows.getRowById(id), "RowsApi.changeOrder.getRowById");
  if (!row) {
    throw Error("Row not found");
  }
  const order = target === "up" ? row.order + 1 : row.order - 1;
  const swapRow = await time(
    prisma.row.findFirst({
      where: {
        entityId: row.entityId,
        tenantId: row.tenantId,
        order,
      },
    }),
    "RowsApi.changeOrder.findFirst"
  );

  // Check if multiple rows have the same order value
  const sameOrderRows = await time(
    prisma.row.findMany({
      where: {
        entityId: row.entityId,
        tenantId: row.tenantId,
        order: row.order,
      },
    }),
    "RowsApi.changeOrder.findMany"
  );

  if (sameOrderRows.length > 1) {
    // If multiple rows have the same order value, assign a unique order value to each row
    await time(
      prisma.$transaction(
        sameOrderRows.map((row, index) =>
          prisma.row.update({
            where: { id: row.id },
            data: { order: index + 1 },
          })
        )
      ),
      "RowsApi.changeOrder.$transaction"
    );
  } else if (swapRow) {
    // If there's only one row with the same order value, swap the order values of the two rows
    await time(
      prisma.$transaction([
        prisma.row.update({ where: { id: row.id }, data: { order } }),
        prisma.row.update({ where: { id: swapRow.id }, data: { order: row.order } }),
      ]),
      "RowsApi.changeOrder.$transaction"
    );
  }
}
function cleanDuplicatedNestedRows(originalRow: RowWithDetailsDto) {
  const originalId = originalRow.id;
  function cleanRows(items: RowDto[]) {
    items.forEach((item) => {
      if (item.id === originalId) {
        item.values = [];
      }
      if ("childRows" in item) {
        cleanRows(item.childRows?.map((f) => f.child) ?? []);
      }
      if ("parentRows" in item) {
        cleanRows(item.parentRows?.map((f) => f.parent) ?? []);
      }
    });
  }
  cleanRows(originalRow.childRows.map((f) => f.child));
  cleanRows(originalRow.parentRows.map((f) => f.parent));
}

