import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { TenantUserInvitation } from "@prisma/client";

export interface ITenantUserInvitationsDb {
  getUserInvitation(id: string): Promise<
    | ({
        tenant: {
          id: string;
          name: string;
          createdAt: Date;
          updatedAt: Date;
          slug: string;
          icon: string | null;
          subscriptionId: string | null;
          active: boolean;
          deactivatedReason: string | null;
        };
      } & {
        id: string;
        tenantId: string;
        email: string;
        firstName: string;
        lastName: string;
        type: number;
        pending: boolean;
        createdUserId: string | null;
        fromUserId: string | null;
      })
    | null
  >;
  getUserInvitations(tenantId?: string | undefined): Promise<
    {
      id: string;
      tenantId: string;
      email: string;
      firstName: string;
      lastName: string;
      type: number;
      pending: boolean;
      createdUserId: string | null;
      fromUserId: string | null;
    }[]
  >;
  createUserInvitation(
    tenantId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      type: TenantUserType;
      fromUserId: string | null;
    }
  ): Promise<{
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    type: number;
    pending: boolean;
    createdUserId: string | null;
    fromUserId: string | null;
  }>;
  updateUserInvitationPending(id: string): Promise<{
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    type: number;
    pending: boolean;
    createdUserId: string | null;
    fromUserId: string | null;
  }>;
  deleteUserInvitation(id: string): Promise<{
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    type: number;
    pending: boolean;
    createdUserId: string | null;
    fromUserId: string | null;
  }>;
  getPending(tenantId: string): Promise<TenantUserInvitation[]>;
}
