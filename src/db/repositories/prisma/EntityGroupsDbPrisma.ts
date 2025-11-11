import { IEntityGroupsDb } from "@/db/interfaces/entityBuilder/IEntityGroupsDb";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { prisma } from "@/db/config/prisma/database";
import EntityModelHelper from "@/lib/helpers/models/EntityModelHelper";
import { EntityGroup } from "@prisma/client";
import { Prisma } from "@prisma/client";
export class EntityGroupsDbPrisma implements IEntityGroupsDb {
  async getAllEntityGroups(): Promise<EntityGroupWithDetailsDto[]> {
    return prisma.entityGroup.findMany({
      include: {
        entities: {
          include: {
            entity: { select: EntityModelHelper.selectSimpleProperties },
            allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
          },
          orderBy: { entity: { order: "asc" } },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async getEntityGroup(id: string): Promise<EntityGroupWithDetailsDto | null> {
    return prisma.entityGroup.findUnique({
      where: { id },
      include: {
        entities: {
          include: {
            entity: { select: EntityModelHelper.selectSimpleProperties },
            allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
          },
          orderBy: { entity: { order: "asc" } },
        },
      },
    });
  }

  async getEntityGroupBySlug(slug: string): Promise<EntityGroupWithDetailsDto | null> {
    return prisma.entityGroup.findUnique({
      where: { slug },
      include: {
        entities: {
          include: {
            entity: { select: EntityModelHelper.selectSimpleProperties },
            allView: { include: { properties: true, filters: true, sort: true, groupByProperty: true } },
          },
          orderBy: { entity: { order: "asc" } },
        },
      },
    });
  }

  async createEntityGroup(data: {
    order: number;
    slug: string;
    title: string;
    icon: string;
    collapsible: boolean;
    section: string | null;
    entities: {
      entityId: string;
      allViewId: string | null;
    }[];
  }): Promise<EntityGroup> {
    return prisma.entityGroup.create({
      data: {
        order: data.order,
        slug: data.slug,
        title: data.title,
        icon: data.icon,
        collapsible: data.collapsible,
        section: data.section,
        entities: {
          create: data.entities.map((f) => {
            return {
              entityId: f.entityId,
              allViewId: f.allViewId,
            };
          }),
        },
      },
    });
  }

  async updateEntityGroup(
    id: string,
    data: {
      order?: number;
      slug?: string;
      title?: string;
      icon?: string;
      collapsible?: boolean;
      section?: string | null;
      entities?: {
        entityId: string;
        allViewId: string | null;
      }[];
    }
  ): Promise<EntityGroup> {
    let update: Prisma.EntityGroupUpdateInput = {
      order: data.order,
      slug: data.slug,
      title: data.title,
      icon: data.icon,
      collapsible: data.collapsible,
      section: data.section,
    };
    if (data.entities) {
      update.entities = {
        deleteMany: {},
        create: data.entities.map((f) => {
          return {
            entityId: f.entityId,
            allViewId: f.allViewId,
          };
        }),
      };
    }
    return prisma.entityGroup.update({
      where: { id },
      data: update,
    });
  }

  async deleteEntityGroup(id: string): Promise<EntityGroup> {
    return prisma.entityGroup.delete({
      where: { id },
    });
  }
}
