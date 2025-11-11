import { Entity, Property } from "@prisma/client";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";

export interface RowFiltersDto {
  customRow: boolean;
  entity: Entity;
  query: string | null;
  properties: {
    property?: Property;
    name?: string;
    value: string | string[] | null;
    condition?: string;
    match?: "and" | "or";
    parentEntity?: EntityRelationshipWithDetailsDto;
  }[];
  tags: string[];
}
