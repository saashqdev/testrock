"use server";

import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import NumberUtils from "@/lib/shared/NumberUtils";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import EntitiesSingleton from "@/modules/rows/repositories/EntitiesSingleton";
import { prisma } from "@/db/config/prisma/database";
import { ApiKey, Prisma, Row, RowValue } from "@prisma/client";
import { Colors } from "@/lib/enums/shared/Colors";
import { db } from "@/db";

const BATCH_SIZE = 10_000;

type TenantDataDto = {
  entity: EntityWithDetailsDto;
  tenant: any;
  activeRows: number;
  shadowRows: number;
};

type LoaderData = {
  allEntities: EntityWithDetailsDto[];
  allTenants: any[];
  items: TenantDataDto[];
  isDevelopment: boolean;
};

type ActionData = {
  error?: string;
  success?: string;
};

// Server Action for loading data
export async function loadData(): Promise<LoaderData> {
  const allEntities = await db.entities.getAllEntities(null);
  const allTenants = await db.tenants.getAll();
  const items: TenantDataDto[] = [];
  const activeRows = await prisma.row.groupBy({
    by: ["entityId", "tenantId"],
    _count: { id: true },
    where: { deletedAt: null },
  });
  const shadowRows = await prisma.row.groupBy({
    by: ["entityId", "tenantId"],
    _count: { id: true },
    where: { deletedAt: { not: null } },
  });
  for (const entity of allEntities) {
    for (const tenant of allTenants) {
      items.push({
        entity,
        tenant,
        activeRows: activeRows.find((f) => f.entityId === entity.id && f.tenantId === tenant.id)?._count?.id ?? 0,
        shadowRows: shadowRows.find((f) => f.entityId === entity.id && f.tenantId === tenant.id)?._count?.id ?? 0,
      });
    }
  }
  const data: LoaderData = {
    allEntities,
    allTenants,
    items,
    isDevelopment: process.env.NODE_ENV !== "production",
  };
  return data;
}

// Server Action for handling form submissions
export async function handleAction(formData: FormData): Promise<ActionData> {
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();
  const allEntities = await db.entities.getAllEntities(null);
  const entityId = formData.get("entityId")?.toString() ?? "";
  const tenantId = formData.get("tenantId")?.toString() ?? "";
  const entity = allEntities.find((e) => e.id === entityId);
  if (!entity) {
    return { error: "Entity not found" };
  }
  const tenant = await db.tenants.getTenant(tenantId);
  if (!tenant) {
    return { error: "Tenant not found" };
  }
  if (action === "create-rows") {
    const numberOfRows = Number(formData.get("numberOfRows")?.toString());
    const type = formData.get("type")?.toString();
    try {
      const status = {
        totalRows: 0,
      };
      const start = performance.now();

      let apiKeys = type === "apiKeyLog" ? await prisma.apiKey.findMany({ where: { tenantId } }) : [];
      for (let i = 0; i < numberOfRows; i += BATCH_SIZE) {
        await Promise.all(
          Array.from({ length: Math.min(BATCH_SIZE, numberOfRows - i) }).map(async (_, idx) => {
            if (type === "apiKeyLog") {
              await createFakeApiKeyLog({ entity, tenantId, idx: i + idx, status, apiKeys });
            } else {
              await createFakeRow({ entity, tenantId, idx: i + idx, status });
            }
          })
        );
      }
      const end = performance.now();
      const formattedTime = `${NumberUtils.intFormat(end - start)}ms`;
      return { success: `${status.totalRows} ${t(entity.titlePlural)} created (${tenant.name}) in ${formattedTime}` };
    } catch (e: any) {
      return { error: e.message };
    }
  } else if (action === "update-rows") {
    const numberOfRows = Number(formData.get("numberOfRows")?.toString());
    const start = performance.now();
    let rows = await prisma.row.findMany({
      where: { entityId, tenantId, deletedAt: null },
      include: { values: true },
    });
    rows = rows.slice(0, numberOfRows);
    if (rows.length === 0) {
      return { error: "No rows found" };
    }
    const status = {
      totalRows: 0,
    };
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      await Promise.all(
        rows.slice(i, i + BATCH_SIZE).map(async (row, idx) => {
          await updateFakeRow(row, { entity, idx: i + idx, status });
        })
      );
    }
    const end = performance.now();
    const formattedTime = `${NumberUtils.intFormat(end - start)}ms`;
    return { success: `${status.totalRows} ${t(entity.titlePlural)} updated (${tenant.name}) in ${formattedTime}` };
  } else if (action === "delete-rows") {
    if (process.env.NODE_ENV !== "development") {
      return { error: "Not allowed in production" };
    }
    const numberOfRows = Number(formData.get("numberOfRows")?.toString());
    let rowsToDelete = await prisma.row.findMany({
      where: { entityId, tenantId },
    });
    rowsToDelete = rowsToDelete.slice(0, numberOfRows);
    if (rowsToDelete.length === 0) {
      return { error: "No rows found" };
    }
    const start = performance.now();
    for (let i = 0; i < rowsToDelete.length; i += BATCH_SIZE) {
      await prisma.row.deleteMany({
        where: { id: { in: rowsToDelete.slice(i, i + BATCH_SIZE).map((f) => f.id) } },
      });
    }
    const end = performance.now();
    const formattedTime = `${NumberUtils.intFormat(end - start)}ms`;
    return { success: `${rowsToDelete.length} ${t(entity.titlePlural)} deleted (${tenant.name}) in ${formattedTime}` };
  } else if (action === "shadow-delete-rows") {
    if (process.env.NODE_ENV !== "development") {
      return { error: "Not allowed in production" };
    }
    const numberOfRows = Number(formData.get("numberOfRows")?.toString());
    let rowsToDelete = await prisma.row.findMany({
      where: { entityId, tenantId, deletedAt: null },
    });
    rowsToDelete = rowsToDelete.slice(0, numberOfRows);
    if (rowsToDelete.length === 0) {
      return { error: "No rows found" };
    }

    const start = performance.now();
    for (let i = 0; i < rowsToDelete.length; i += BATCH_SIZE) {
      await prisma.row.updateMany({
        where: { id: { in: rowsToDelete.slice(i, i + BATCH_SIZE).map((f) => f.id) } },
        data: { deletedAt: new Date() },
      });
    }
    const end = performance.now();
    const formattedTime = `${NumberUtils.intFormat(end - start)}ms`;
    return { success: `${rowsToDelete.length} ${t(entity.titlePlural)} deleted (${tenant.name}) in ${formattedTime}` };
  } else {
    return { error: "Unknown action" };
  }
}

async function createFakeRow({ entity, tenantId, idx, status }: { entity: EntityWithDetailsDto; tenantId: string; idx: number; status: { totalRows: number } }) {
  const values: Prisma.RowValueUncheckedCreateWithoutRowInput[] = [];
  let tag = entity.tags.find((f) => f.value === "fake-row");
  if (!tag) {
    tag = await prisma.entityTag.create({
      data: {
        entityId: entity.id,
        value: "fake-row",
        color: Colors.RED,
      },
    });
    entity.tags.push(tag);
  }
  tag = entity.tags.find((f) => f.value === "fake-row");
  if (!tag) {
    throw Error("Could not create tag: fake-row");
  }
  for (const property of entity.properties) {
    const propertyId = property.id;
    if ([PropertyType.TEXT].includes(property.type)) {
      values.push({ propertyId, textValue: `Fake ${idx}` });
    } else if ([PropertyType.NUMBER].includes(property.type)) {
      values.push({ propertyId, numberValue: idx.toString() });
    } else if ([PropertyType.BOOLEAN].includes(property.type)) {
      values.push({ propertyId, booleanValue: idx % 2 === 0 });
    } else if ([PropertyType.DATE].includes(property.type)) {
      values.push({ propertyId, dateValue: new Date().toISOString() });
    } else if ([PropertyType.SELECT].includes(property.type)) {
      const firstOption = property.options.length > 0 ? property.options[0] : null;
      values.push({ propertyId, textValue: firstOption?.value ?? idx.toString() });
    } else if ([PropertyType.MEDIA].includes(property.type)) {
      values.push({ propertyId, media: { create: { title: "Fake", name: "Fake", file: "Fake", type: "Fake" } } });
    } else if ([PropertyType.RANGE_DATE].includes(property.type)) {
      values.push({ propertyId, range: { create: { dateMin: new Date(), dateMax: new Date(), numberMin: null, numberMax: null } } });
    } else if ([PropertyType.RANGE_NUMBER].includes(property.type)) {
      values.push({ propertyId, range: { create: { dateMin: null, dateMax: null, numberMin: 1, numberMax: 2 } } });
    } else {
      throw new Error(`[${entity.name}] Unknown property type ${PropertyType[property.type]}`);
    }
  }
  const row = await prisma.row.create({
    data: {
      entityId: entity.id,
      tenantId,
      folio: idx,
      order: idx,
      values: {
        create: values,
      },
      permissions: { create: { tenantId, access: "delete" } },
      tags: { create: { tagId: tag.id } },
    },
  });
  status.totalRows++;

  await Promise.all(
    entity.childEntities.map(async (childRel) => {
      const childEntity = EntitiesSingleton.getInstance()
        .getEntities()
        .find((e) => e.id === childRel.childId);
      if (!childEntity) {
        return;
      }
      const childRow = await createFakeRow({ entity: childEntity, tenantId, idx, status });
      status.totalRows++;

      return await prisma.rowRelationship.create({
        data: {
          relationshipId: childRel.id,
          parentId: row.id,
          childId: childRow.id,
          metadata: null,
        },
      });
    })
  );
  return row;
}

async function createFakeApiKeyLog({
  entity,
  tenantId,
  idx,
  status,
  apiKeys,
}: {
  entity: EntityWithDetailsDto;
  tenantId: string;
  idx: number;
  status: { totalRows: number };
  apiKeys: ApiKey[];
}) {
  if (apiKeys.length === 0) {
    throw new Error("No API keys found");
  }
  const firstApiKey = apiKeys[0];
  const apiKeyLog = await prisma.apiKeyLog.create({
    data: {
      apiKeyId: firstApiKey.id,
      tenantId,
      ip: "fake-ip",
      endpoint: "/fake-endpoint",
      method: "fake-method",
      params: `{ "fake": "params" }`,
      status: 200,
      duration: 1, // 1 ms
      error: null,
    },
  });
  status.totalRows++;
  return apiKeyLog;
}

async function updateFakeRow(
  row: Row & { values: RowValue[] },
  { entity, idx, status }: { entity: EntityWithDetailsDto; idx: number; status: { totalRows: number } }
) {
  const values: Prisma.RowValueUpdateWithWhereUniqueWithoutRowInput[] = [];
  for (const property of entity.properties) {
    const value = row.values.find((f) => f.propertyId === property.id);
    if (!value) {
      continue;
    }
    if ([PropertyType.TEXT].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { textValue: "Updated " + value.textValue } });
    } else if ([PropertyType.NUMBER].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { numberValue: idx + 100 } });
    } else if ([PropertyType.BOOLEAN].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { booleanValue: idx % 2 !== 0 } });
    } else if ([PropertyType.DATE].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { dateValue: new Date().toISOString() } });
    } else if ([PropertyType.SELECT].includes(property.type)) {
      const firstOption = property.options.length > 0 ? property.options[0] : null;
      values.push({ where: { id: value.id }, data: { textValue: firstOption?.value ?? idx.toString() } });
    } else if ([PropertyType.MEDIA].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { media: { create: { title: "Fake", name: "Fake", file: "Fake", type: "Fake" } } } });
    } else if ([PropertyType.RANGE_DATE].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { range: { create: { dateMin: new Date(), dateMax: new Date(), numberMin: null, numberMax: null } } } });
    } else if ([PropertyType.RANGE_NUMBER].includes(property.type)) {
      values.push({ where: { id: value.id }, data: { range: { create: { dateMin: null, dateMax: null, numberMin: 1, numberMax: 2 } } } });
    } else {
      throw new Error(`[${entity.name}] Unknown property type ${PropertyType[property.type]}`);
    }
  }
  await prisma.row.update({
    where: { id: row.id },
    data: {
      values: {
        update: values,
      },
    },
  });
  status.totalRows++;

  return row;
}
