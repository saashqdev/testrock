import { Tenant } from "@prisma/client";

export type TenantUserInvitationsModel = {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  pending: boolean;
  createdUserId: string | null;
  fromUserId: string | null;
};

export type TenantUserInvitationWithTenantDto = TenantUserInvitationsModel & {
  tenant: Tenant;
};
