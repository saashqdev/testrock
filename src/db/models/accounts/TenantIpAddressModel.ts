import { UserDto } from "@/db/models/accounts/UsersModel";
import { Tenant, ApiKey, TenantIpAddress } from "@prisma/client";

export type TenantIpAddressModel = {
  id: string;
  tenantId: string;
};

export type TenantIpAddressWithDetailsDto = TenantIpAddress & {
  tenant: Tenant;
  user: UserDto | null;
  apiKey: ApiKey | null;
};
