import { EntityRelationship } from "@prisma/client";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";

export type EntityRelationshipsModel = {
  id: string;
  entityId: string;
  relatedEntityId: string;
  relationshipType: string;
};

export type EntityRelationshipWithDetailsDto = EntityRelationship & {
  parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null };
  child: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null };
  childEntityView: EntityViewsWithDetailsDto | null;
  parentEntityView: EntityViewsWithDetailsDto | null;
};

export type EntityRelationshipWithCountDto = EntityRelationshipWithDetailsDto & {
  _count: { rows: number };
};
