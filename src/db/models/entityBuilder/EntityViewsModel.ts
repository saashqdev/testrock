import { EntityView, EntityViewFilter, EntityViewProperty, EntityViewSort, Property } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";

export type EntityViewsModel = {
  id: string;
  name: string;
  description?: string;
  properties: Property[];
};

export type EntityViewsWithDetailsDto = EntityView & {
  properties: EntityViewProperty[];
  filters: EntityViewFilter[];
  sort: EntityViewSort[];
  groupByProperty: Property | null;
};

export type EntityViewsWithTenantAndUserDto = EntityViewsWithDetailsDto & {
  entity: EntityDto;
  createdByUser: UserDto | null;
  tenant: TenantDto | null;
  user: UserDto | null;
};
