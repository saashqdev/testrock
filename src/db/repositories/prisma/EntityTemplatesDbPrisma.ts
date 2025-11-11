import { IEntityTemplatesDb } from "@/db/interfaces/entityBuilder/IEntityTemplatesDb";
import { prisma } from "@/db/config/prisma/database";
export class EntityTemplatesDbPrisma implements IEntityTemplatesDb {
  async getEntityTemplates(entityId: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.entityTemplate.findMany({
      where: { entityId, tenantId },
      orderBy: { entity: { order: "asc" } },
    });
  }

  async getEntityTemplate(id: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.entityTemplate
      .findFirstOrThrow({
        where: { id, tenantId },
      })
      .catch(() => {
        return null;
      });
  }

  async createEntityTemplate(data: { tenantId: string | null; entityId: string; title: string; config: string }) {
    return await prisma.entityTemplate.create({
      data: {
        tenantId: data.tenantId,
        entityId: data.entityId,
        title: data.title,
        config: data.config,
      },
    });
  }

  async updateEntityTemplate(id: string, data: { title: string; config: string }) {
    return await prisma.entityTemplate.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteEntityTemplate(id: string) {
    return await prisma.entityTemplate.delete({
      where: { id },
    });
  }
}
