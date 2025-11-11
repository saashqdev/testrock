import { EntityRelationshipWithCountDto, EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
export interface IEntityRelationshipsDb {
  getAllEntityRelationships(): Promise<EntityRelationshipWithDetailsDto[]>;
  findEntityRelationship({
    parentId,
    childId,
    title,
    notIn,
  }: {
    parentId: string;
    childId: string;
    title: string | null;
    notIn?: string[];
  }): Promise<EntityRelationshipWithCountDto | null>;
  getEntityRelationships(entityId: string): Promise<EntityRelationshipWithDetailsDto[]>;
  getEntityRelationshipsWithCount(entityId: string): Promise<EntityRelationshipWithCountDto[]>;
  getEntitiesRelationship({
    parentEntityId,
    childEntityId,
  }: {
    parentEntityId: string;
    childEntityId: string;
  }): Promise<EntityRelationshipWithDetailsDto | null>;
  getEntityRelationship(id: string): Promise<EntityRelationshipWithCountDto | null>;
  createEntityRelationship({
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
  }): Promise<{
    parentId: string;
    childId: string;
    title: string | null;
    order: number | null;
    type: string;
    required: boolean;
    cascade: boolean;
    readOnly: boolean;
    hiddenIfEmpty: boolean;
    childEntityViewId: string | null;
    parentEntityViewId: string | null;
    id: string;
  }>;

  updateEntityRelationship(
    id: string,
    data: {
      parentId?: string | undefined;
      childId?: string | undefined;
      order?: number | undefined;
      title?: string | null | undefined;
      type?: string | undefined;
      required?: boolean | undefined;
      cascade?: boolean | undefined;
      readOnly?: boolean | undefined;
      hiddenIfEmpty?: boolean | undefined;
      childEntityViewId?: string | null | undefined;
      parentEntityViewId?: string | null | undefined;
    }
  ): Promise<{
    title: string | null;
    parentId: string;
    childId: string;
    order: number | null;
    type: string;
    required: boolean;
    cascade: boolean;
    readOnly: boolean;
    hiddenIfEmpty: boolean;
    childEntityViewId: string | null;
    parentEntityViewId: string | null;
    id: string;
  }>;
  deleteEntityRelationship(id: string): Promise<{ id: string }>;
}
