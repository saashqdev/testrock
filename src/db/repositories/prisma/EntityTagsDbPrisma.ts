import { IEntityTagsDb } from "@/db/interfaces/entityBuilder/IEntityTagsDb";
import { EntityTag } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
export class EntityTagsDbPrisma implements IEntityTagsDb {
  async getEntityTags(entityId: string): Promise<EntityTag[]> {
    return await prisma.entityTag.findMany({
      where: {
        entityId,
      },
    });
  }

  async getEntityTagById(id: string): Promise<EntityTag | null> {
    return await prisma.entityTag.findUnique({
      where: {
        id,
      },
    });
  }

  async getEntityTag(entityId: string, value: string): Promise<EntityTag | null> {
    return await prisma.entityTag.findFirst({
      where: {
        entityId,
        value,
      },
    });
  }

  async getEntityTagByEntityName(entityName: string, value: string): Promise<EntityTag | null> {
    return await prisma.entityTag.findFirst({
      where: {
        entity: { name: entityName },
        value,
      },
    });
  }

  async createEntityTag(data: { entityId: string; color: number; value: string }) {
    return await prisma.entityTag.create({
      data,
    });
  }

  async updateEntityTag(id: string, data: { color?: number; value?: string }) {
    return await prisma.entityTag.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteEntityTag(id: string) {
    return await prisma.entityTag.delete({
      where: {
        id,
      },
    });
  }
}
