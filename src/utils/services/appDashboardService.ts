import { TFunction } from "i18next";
import { DefaultEntityTypes } from "@/lib/dtos/shared/DefaultEntityTypes";
import { Stat } from "@/lib/dtos/stats/Stat";
import { getStatChangePercentage, getStatChangeType } from "../app/DashboardUtils";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { GetRowsData, getAll } from "@/utils/api/server/RowsApi";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";

export async function getAppDashboardStats({
  t,
  tenant,
  gte,
  entities,
}: {
  t: TFunction;
  tenant: TenantDto | null;
  gte: Date | undefined | undefined;
  entities?: EntityDto[];
}): Promise<Stat[]> {
  if (!tenant) {
    return [];
  }
  if (!entities) {
    entities = await db.entities.getAllEntities(tenant.id);
  }
  const promises = entities.map((entity) => getEntityStat(entity, tenant.id, gte));
  const stats = await Promise.all(promises);
  return stats;
}

export async function getEntityStat(entity: EntityDto, tenantId: string, gte: Date | undefined) {
  const { total, added } = await getRowsCreatedSince(entity.id, tenantId, gte);

  const stat: Stat = {
    name: entity.titlePlural,
    hint: "",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: getStatChangePercentage(added, total) + "%",
    changeType: getStatChangeType(added, total),
    entity: {
      slug: entity.slug,
    },
  };
  return stat;
}

async function getRowsCreatedSince(entityId: string, tenantId: string, gte: Date | undefined) {
  const added = await prisma.row.count({
    where: {
      entityId,
      tenantId,
      createdAt: {
        gte,
      },
    },
  });
  const total = await prisma.row.count({
    where: {
      entityId,
      tenantId,
    },
  });

  return {
    added,
    total,
  };
}

export type EntitySummaryDto = {
  order: number;
  rowsData: GetRowsData;
};
export async function getEntitySummaries({
  entities,
  tenantId,
}: {
  entities: { name: string; pageSize?: number }[];
  tenantId: string | null;
}): Promise<EntitySummaryDto[]> {
  const entitySummaries: EntitySummaryDto[] = [];

  await Promise.all(
    entities.map(async ({ name, pageSize }, idx) => {
      const entitySummary = {
        order: idx,
        rowsData: await getAll({
          entity: { name },
          tenantId,
          pageSize: pageSize || 3,
          urlSearchParams: new URLSearchParams({
            view: "null",
          }),
        }),
      };
      entitySummaries.push(entitySummary);
    })
  );

  return entitySummaries;
}
