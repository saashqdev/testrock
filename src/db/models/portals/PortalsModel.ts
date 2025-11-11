import { Portal } from "@prisma/client";
import { TenantDto } from "@/db/models/accounts/TenantsModel";

export type PortalsModel = {
  id: string;
  name: string;
  description?: string;
  domain: string;
};

export type PortalWithDetailsDto = Portal & {
  tenant: TenantDto | null;
};

export type PortalWithCountDto = PortalWithDetailsDto & {
  _count: {
    users: number;
    subscriptionProducts: number;
  };
};
