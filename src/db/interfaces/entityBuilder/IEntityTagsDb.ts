import { EntityTag } from "@prisma/client";

export interface IEntityTagsDb {
  getEntityTags(entityId: string): Promise<
    {
      id: string;
      createdAt: Date;
      entityId: string;
      value: string;
      color: number;
    }[]
  >;
  getEntityTagById(id: string): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  } | null>;
  getEntityTag(
    entityId: string,
    value: string
  ): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  } | null>;
  getEntityTagByEntityName(
    entityName: string,
    value: string
  ): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  } | null>;
  createEntityTag(data: { entityId: string; color: number; value: string }): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  }>;
  updateEntityTag(
    id: string,
    data: {
      color?: number | undefined;
      value?: string | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  }>;
  deleteEntityTag(id: string): Promise<{
    id: string;
    createdAt: Date;
    entityId: string;
    value: string;
    color: number;
  }>;
}
