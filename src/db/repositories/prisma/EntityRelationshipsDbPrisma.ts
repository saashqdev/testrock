import { IEntityRelationshipsDb } from "@/db/interfaces/entityBuilder/IEntityRelationshipsDb";
import { EntityRelationshipWithCountDto, EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import { prisma } from "@/db/config/prisma/database";
import EntityModelHelper from "@/lib/helpers/models/EntityModelHelper";
import EntityViewModelHelper from "@/lib/helpers/models/EntityViewModelHelper";
export class EntityRelationshipsDbPrisma implements IEntityRelationshipsDb {
  async getAllEntityRelationships(): Promise<EntityRelationshipWithDetailsDto[]> {
    return await prisma.entityRelationship.findMany({
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
      },
    });
  }
  async findEntityRelationship({
    parentId,
    childId,
    title,
    notIn,
  }: {
    parentId: string;
    childId: string;
    title: string | null;
    notIn?: string[];
  }): Promise<EntityRelationshipWithCountDto | null> {
    return await prisma.entityRelationship.findFirst({
      where: {
        OR: [
          { parentId, childId },
          { parentId: childId, childId: parentId },
        ],
        title,
        id: {
          notIn,
        },
      },
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
        _count: true,
      },
    });
  }

  async getEntityRelationships(entityId: string): Promise<EntityRelationshipWithDetailsDto[]> {
    return await prisma.entityRelationship.findMany({
      where: {
        OR: [
          {
            parentId: entityId,
          },
          {
            childId: entityId,
          },
        ],
      },
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
      },
      orderBy: [{ order: "asc" }],
    });
  }

  async getEntityRelationshipsWithCount(entityId: string): Promise<EntityRelationshipWithCountDto[]> {
    return await prisma.entityRelationship.findMany({
      where: {
        OR: [{ parentId: entityId }, { childId: entityId }],
      },
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
        _count: true,
      },
      orderBy: [{ order: "asc" }],
    });
  }

  async getEntitiesRelationship({
    parentEntityId,
    childEntityId,
  }: {
    parentEntityId: string;
    childEntityId: string;
  }): Promise<EntityRelationshipWithDetailsDto | null> {
    return await prisma.entityRelationship.findFirst({
      where: {
        parentId: parentEntityId,
        childId: childEntityId,
      },
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
      },
      orderBy: [{ order: "asc" }],
    });
  }

  async getEntityRelationship(id: string): Promise<EntityRelationshipWithCountDto | null> {
    return await prisma.entityRelationship.findUnique({
      where: {
        id,
      },
      include: {
        parent: { select: EntityModelHelper.selectEntityWithoutIcon },
        child: { select: EntityModelHelper.selectEntityWithoutIcon },
        childEntityView: { include: EntityViewModelHelper.includeDetails },
        parentEntityView: { include: EntityViewModelHelper.includeDetails },
        _count: true,
      },
    });
  }

  async createEntityRelationship({
    parentId,
    childId,
    order,
    title,
    type,
    required,
    cascade,
    readOnly,
    hiddenIfEmpty,
    childEntityViewId,
    parentEntityViewId,
  }: {
    parentId: string;
    childId: string;
    order: number;
    title: string | null;
    type: string;
    required: boolean;
    cascade: boolean;
    readOnly: boolean;
    hiddenIfEmpty: boolean;
    childEntityViewId: string | null;
    parentEntityViewId: string | null;
  }) {
    return await prisma.entityRelationship.create({
      data: {
        parentId,
        childId,
        order,
        title,
        type,
        required,
        cascade,
        readOnly,
        hiddenIfEmpty,
        childEntityViewId,
        parentEntityViewId,
      },
    });
  }

  async updateEntityRelationship(
    id: string,
    data: {
      parentId?: string;
      childId?: string;
      order?: number;
      title?: string | null;
      type?: string;
      required?: boolean;
      cascade?: boolean;
      readOnly?: boolean;
      hiddenIfEmpty?: boolean;
      childEntityViewId?: string | null;
      parentEntityViewId?: string | null;
    }
  ) {
    return await prisma.entityRelationship.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async deleteEntityRelationship(id: string) {
    return await prisma.entityRelationship.delete({
      where: {
        id,
      },
    });
  }
}
