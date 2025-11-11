import { Entity } from "@prisma/client";
import { Stat } from "@/lib/dtos/stats/Stat";
import { getStatChangeType } from "../app/DashboardUtils";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import DateUtils from "@/lib/shared/DateUtils";

export async function getCustomEntitiesDashboardStats(lastDays: number): Promise<Stat[]> {
  const entities = await db.entities.getAllEntities(null);
  const stats = entities.map(async (entity) => {
    return await getEntityStat(entity, lastDays);
  });
  return await Promise.all(stats);
}

async function getEntityStat(entity: Entity, lastDays: number) {
  const { added, total } = await getEntityCreatedSince(entity.id, lastDays);
  const tenantStat: Stat = {
    name: entity.titlePlural,
    hint: "",
    stat: added.toString(),
    previousStat: (total - added).toString(),
    change: "+" + added.toString(),
    changeType: getStatChangeType(added, total),
  };
  return tenantStat;
}

async function getEntityCreatedSince(entityId: string, lastDays: number) {
  const from = DateUtils.daysFromDate(new Date(), lastDays * -1);
  const added = await prisma.row.count({
    where: {
      entityId,
      createdAt: {
        gte: from,
      },
    },
  });
  const total = await prisma.row.count({
    where: {
      entityId,
    },
  });

  return {
    added,
    total,
  };
}
