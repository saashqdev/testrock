import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export async function getCreateNewRow({ entityName, createdByUserId, tenantId }: { entityName: string; createdByUserId: string; tenantId?: string | null }) {
  const entity = await prisma.entity.findUnique({ where: { name: entityName } });
  if (!entity) {
    throw new Error("Entity required: " + entityName);
  }
  let folio = 1;
  const maxFolio = await db.rows.getMaxRowFolio({ tenantId: tenantId ?? null, entityId: entity.id });
  if (maxFolio && maxFolio._max.folio !== null) {
    folio = maxFolio._max.folio + 1;
  }
  return {
    row: {
      create: {
        entityId: entity.id,
        createdByUserId,
        tenantId: tenantId ?? null,
        folio,
      },
    },
  };
}

export async function createNewRowWithEntity({
  entity,
  createdByUserId,
  tenantId,
  request,
  nextFolio,
}: {
  entity: EntityWithDetailsDto;
  createdByUserId: string | null;
  tenantId?: string | null;
  request?: Request;
  nextFolio?: number;
}) {
  const row = await db.rows.createRow({
    entity,
    data: {
      createdByUserId,
      tenantId: tenantId ?? null,
      properties: {},
      dynamicProperties: [],
    },
    nextFolio,
  });
  const item = await db.rows.getRow({ entityId: entity.id, id: row!.id, tenantId: tenantId ?? null });
  if (row) {
    if (request) {
      await db.logs.createRowLog(request, {
        tenantId: tenantId ?? null,
        createdByUserId,
        action: DefaultLogActions.Created,
        entity,
        item,
      });
    } else {
      await db.logs.createManualRowLog(
        {
          tenantId: tenantId ?? null,
          createdByUserId,
          action: DefaultLogActions.Created + " " + entity.title,
          entity,
          item,
        },
        request
      );
    }
  }
  return row;
}
