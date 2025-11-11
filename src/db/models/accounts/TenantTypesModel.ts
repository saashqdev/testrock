import { SubscriptionProduct, TenantType } from "@prisma/client";

export type TenantTypesModel = {
  id: string;
  description: string | null;
};

export type TenantTypesDto = {
  id: string;
  description: string | null;
};

export type TenantTypeWithDetailsDto = TenantType & {
  subscriptionProducts: SubscriptionProduct[];
  _count: { tenants: number };
};
