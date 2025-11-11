import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { EntityGroup } from "@prisma/client";
export interface IEntityGroupsDb {
  getAllEntityGroups(): Promise<EntityGroupWithDetailsDto[]>;
  getEntityGroup(id: string): Promise<EntityGroupWithDetailsDto | null>;
  getEntityGroupBySlug(slug: string): Promise<EntityGroupWithDetailsDto | null>;
  createEntityGroup(data: {
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
  }): Promise<EntityGroup>;
  updateEntityGroup(
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
  ): Promise<EntityGroup>;
  deleteEntityGroup(id: string): Promise<EntityGroup>;
}
