import { ApiKeyEntity, Entity } from "@prisma/client";
import { ApiKeyEntityPermissionDto } from "@/lib/dtos/apiKeys/ApiKeyEntityPermissionDto";
import { db } from "@/db";

export async function getApiKeyEntityPermissions(
  entities:
    | {
        entityId: string;
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      }[]
    | (ApiKeyEntity & { entity: Entity })[]
): Promise<ApiKeyEntityPermissionDto[]> {
  const apiKeyEntities = await db.entities.getEntitiesInIds(entities.map((f) => f.entityId));
  const entityPermissions: ApiKeyEntityPermissionDto[] = [];
  entities.forEach((apiKeyEntity) => {
    const entity = apiKeyEntities.find((f) => f.id === apiKeyEntity.entityId);
    entityPermissions.push({
      id: apiKeyEntity.entityId,
      name: entity?.name ?? "",
      create: apiKeyEntity.create,
      read: apiKeyEntity.read,
      update: apiKeyEntity.update,
      delete: apiKeyEntity.delete,
    });
  });
  return entityPermissions;
}
