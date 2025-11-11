import { ITenantUserInvitationsDb } from "@/db/interfaces/accounts/ITenantUserInvitationsDb";
import { prisma } from "@/db/config/prisma/database";
import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { TenantUserInvitation } from "@prisma/client";

export class TenantUserInvitationsDbPrisma implements ITenantUserInvitationsDb {
  async getUserInvitation(id: string) {
    return await prisma.tenantUserInvitation.findFirst({
      where: {
        id,
        pending: true,
      },
      include: {
        tenant: true,
      },
    });
  }

  async getUserInvitations(tenantId?: string) {
    if (!tenantId) {
      return [];
    }
    return await prisma.tenantUserInvitation.findMany({
      where: {
        tenantId,
        pending: true,
      },
    });
  }

  async createUserInvitation(
    tenantId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      type: TenantUserType;
      fromUserId: string | null;
    }
  ) {
    const invitation = await prisma.tenantUserInvitation.create({
      data: {
        tenantId,
        ...data,
        pending: true,
      },
    });

    return invitation;
  }

  async updateUserInvitationPending(id: string) {
    return await prisma.tenantUserInvitation.update({
      where: {
        id,
      },
      data: {
        pending: false,
      },
    });
  }

  async deleteUserInvitation(id: string) {
    return await prisma.tenantUserInvitation.delete({
      where: {
        id,
      },
    });
  }

  async getPending(tenantId: string): Promise<TenantUserInvitation[]> {
    return await prisma.tenantUserInvitation.findMany({
      where: {
        tenantId,
        pending: true,
      },
    });
  }
}
