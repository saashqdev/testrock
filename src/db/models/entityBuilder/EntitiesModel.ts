import { Entity, EntityRelationship, EntityTag, EntityTemplate, Property, PropertyAttribute, PropertyOption } from "@prisma/client";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";

export type EntityModel = {
  id: string;
  name: string;
  description?: string;
};

export type EntityDto = {
  id: string;
  order: number;
  name: string;
  title: string;
  titlePlural: string;
  active: boolean;
  slug: string;
  type: string;
  hasApi: boolean;
  showInSidebar: boolean;
  icon: string;
  onEdit: string | null;
};

export type RowsUsageDto = { entityId: string; _count: number };
export type EntityWithPropertiesDto = Entity & {
  properties: PropertyWithDetailsDto[];
};

export type EntityWithDetailsDto = Entity & {
  properties: PropertyWithDetailsDto[];
  views: EntityViewsWithDetailsDto[];
  tags: EntityTag[];
  parentEntities: EntityRelationshipWithDetailsDto[];
  childEntities: EntityRelationshipWithDetailsDto[];
  templates: EntityTemplate[];
};

export type EntityWithDetailsAndRelationshipsDto = EntityWithDetailsDto & {
  parentEntities: (EntityRelationship & { parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null } })[];
  childEntities: (EntityRelationship & { parent: { id: string; name: string; title: string; titlePlural: string; slug: string; onEdit: string | null } })[];
};

export type EntityWithCountDto = EntityWithDetailsDto & {
  _count: { rows: number };
};

export type PropertyWithDetailsDto = Property & {
  // entity: EntityWithDetails;
  attributes: PropertyAttribute[];
  options: PropertyOption[];
  parent?: PropertyWithDetailsDto;
  formula: { name: string; resultAs: string; calculationTrigger: string } | null;
};
