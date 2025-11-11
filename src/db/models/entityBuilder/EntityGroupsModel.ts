import { EntityGroup, EntityGroupEntity } from "@prisma/client";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";

export type EntityGroupsModel = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export type EntityGroupWithDetailsDto = EntityGroup & {
  entities: EntityGroupEntityWithDetailsDto[];
};

export type EntityGroupEntityWithDetailsDto = EntityGroupEntity & {
  entity: EntityDto;
  allView: EntityViewsWithDetailsDto | null;
};
