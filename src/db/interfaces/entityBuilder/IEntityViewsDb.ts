import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { EntityViewsWithTenantAndUserDto, EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
export interface IEntityViewsDb {
  getAllEntityViews(params: {
    type?: string;
    entityId?: string;
    pagination?: { pageSize: number; page: number };
    filters?: FiltersDto;
  }): Promise<{ items: EntityViewsWithTenantAndUserDto[]; total: number }>;

  getEntityViews(
    entityId: string,
    options?: {
      tenantId?: string | null;
      userId?: string | null;
    }
  ): Promise<EntityViewsWithDetailsDto[]>;

  getEntityView(id: string): Promise<EntityViewsWithDetailsDto | null>;
  getEntityViewWithTenantAndUser(id: string): Promise<EntityViewsWithTenantAndUserDto | null>;
  getEntityViewByName({ entityId, name, isSystem }: { entityId: string; name: string; isSystem?: boolean }): Promise<EntityViewsWithDetailsDto | null>;
  getEntityViewDefault({ entityId, isSystem }: { entityId: string; isSystem?: boolean }): Promise<EntityViewsWithDetailsDto | null>;
  getEntityViewByOrder(entityId: string, order: number): Promise<EntityViewsWithDetailsDto | null>;
  getMaxEntityViewOrder(entityId: string): Promise<number>;
  createEntityView(data: {
    entityId: string;
    tenantId: string | null;
    userId: string | null;
    createdByUserId: string | null;
    layout: string;
    name: string;
    title: string;
    isDefault: boolean;
    isSystem: boolean;
    pageSize: number;
    groupByPropertyId?: string | null;
    gridColumns?: number | null;
    gridColumnsSm?: number | null;
    gridColumnsMd?: number | null;
    gridColumnsLg?: number | null;
    gridColumnsXl?: number | null;
    gridColumns2xl?: number | null;
    gridGap?: string | null;
    order?: number | null;
  }): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    groupByPropertyId: string | null;
    isDefault: boolean;
    isSystem: boolean;
    layout: string;
    pageSize: number;
    title: string;
    updatedAt: Date;
    entityId: string;
    tenantId: string | null;
    userId: string | null;
    createdByUserId: string | null;
    gridColumns: number | null;
    gridColumnsSm: number | null;
    gridColumnsMd: number | null;
    gridColumnsLg: number | null;
    gridColumnsXl: number | null;
    gridColumns2xl: number | null;
    gridGap: string | null;
    order: number | null;
  }>;
  updateEntityViewProperties(
    id: string,
    items: { propertyId: string | null; name: string; order: number }[]
  ): Promise<{ name: string | null; id: string; order: number; entityViewId: string; propertyId: string | null }[]>;
  updateEntityViewFilters(
    id: string,
    items: { name: string; condition: string; value: string; match: string }[]
  ): Promise<{ id: string; name: string; condition: string; value: string; match: string; entityViewId: string }[]>;
  updateEntityViewSort(
    id: string,
    items: { name: string; asc: boolean; order: number }[]
  ): Promise<{ id: string; name: string; asc: boolean; order: number; entityViewId: string }[]>;
  updateEntityView(
    id: string,
    data: {
      layout?: string;
      isDefault?: boolean;
      isSystem?: boolean;
      pageSize?: number;
      name?: string;
      title?: string;
      order?: number;
      groupByPropertyId?: string | null;
      gridColumns?: number;
      gridColumnsSm?: number;
      gridColumnsMd?: number;
      gridColumnsLg?: number;
      gridColumnsXl?: number;
      gridColumns2xl?: number;
      gridGap?: string;
    }
  ): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    groupByPropertyId: string | null;
    isDefault: boolean;
    isSystem: boolean;
    layout: string;
    pageSize: number;
    title: string;
    updatedAt: Date;
    entityId: string;
    tenantId: string | null;
    userId: string | null;
    createdByUserId: string | null;
    gridColumns: number | null;
    gridColumnsSm: number | null;
    gridColumnsMd: number | null;
    gridColumnsLg: number | null;
    gridColumnsXl: number | null;
    gridColumns2xl: number | null;
    gridGap: string | null;
    order: number | null;
  }>;
  deleteEntityView(id: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string | null;
    entityId: string;
    tenantId: string | null;
    userId: string | null;
    layout: string;
    order: number;
    title: string;
    pageSize: number;
    isDefault: boolean;
    isSystem: boolean;
    gridColumns: number | null;
    gridColumnsSm: number | null;
    gridColumnsMd: number | null;
    gridColumnsLg: number | null;
    gridColumnsXl: number | null;
    gridColumns2xl: number | null;
    gridGap: string | null;
    groupByPropertyId: string | null;
  }>;
}
