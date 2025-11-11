import { Tenant, TenantInboundAddress, TenantSettingsRow, TenantType, TenantUser } from "@prisma/client";
import { TenantSubscriptionWithDetailsDto, UserDto, UserWithRolesDto } from "..";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

export type TenantsModel = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  deactivatedReason: string | null;
  types: TenantType[];
  active: boolean;
};

export type TenantDto = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  deactivatedReason: string | null;
  types: TenantType[];
  active: boolean;
};

export type TenantWithDetailsDto = Tenant & {
  inboundAddresses: TenantInboundAddress[];
  users: (TenantUser & {
    user: UserDto;
  })[];
  subscription: TenantSubscriptionWithDetailsDto | null;
  tenantSettingsRow: (TenantSettingsRow & { row: RowWithDetailsDto }) | null;
  types: TenantType[];
};

export type TenantWithUsageDto = TenantWithDetailsDto & {
  _count: {
    users?: number;
    invitations?: number;
    rows?: number;
    logs?: number;
    apiKeys?: number;
    events?: number;
  };
};

export type TenantUserWithUserDto = TenantUser & {
  user: UserWithRolesDto;
};

export type TenantUserWithDetailsDto = TenantUser & {
  tenant: Tenant;
  user: UserDto;
};
