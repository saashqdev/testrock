import { Prisma } from "@prisma/client";

export interface IRowRelationshipsDb {
  getRowRelationship(id: string): Promise<
    | ({
        relationship: {
          id: string;
          parentId: string;
          childId: string;
          order: number | null;
          title: string | null;
          type: string;
          required: boolean;
          cascade: boolean;
          readOnly: boolean;
          hiddenIfEmpty: boolean;
          childEntityViewId: string | null;
          parentEntityViewId: string | null;
        };
      } & {
        id: string;
        createdAt: Date;
        relationshipId: string;
        parentId: string;
        childId: string;
        metadata: string | null;
      })
    | null
  >;
  createRowRelationship({
    parentId,
    childId,
    relationshipId,
    metadata,
  }: {
    parentId: string;
    childId: string;
    relationshipId: string;
    metadata: string | null;
  }): Promise<void | {
    id: string;
    createdAt: Date;
    relationshipId: string;
    parentId: string;
    childId: string;
    metadata: string | null;
  }>;
  deleteRowRelationship({ parentId, childId }: { parentId: string; childId: string }): Promise<Prisma.BatchPayload>;
  deleteRowRelationshipById(id: string): Promise<{
    parentId: string;
    childId: string;
    relationshipId: string;
    metadata: string | null;
    id: string;
    createdAt: Date;
  }>;
}
