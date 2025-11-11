import { IPortalCheckoutSessionsDb } from "@/db/interfaces/portals/IPortalCheckoutSessionsDb";
import { prisma } from "@/db/config/prisma/database";

export class PortalCheckoutSessionsDbPrisma implements IPortalCheckoutSessionsDb {
  async getCheckoutSessionStatus(id: string) {
    return prisma.portalCheckoutSessionStatus.findUnique({
      where: { id },
    });
  }

  async createCheckoutSessionStatus(data: { id: string; portalId: string; email: string; fromUrl: string; fromUserId?: string | null }) {
    return prisma.portalCheckoutSessionStatus.create({
      data: {
        id: data.id,
        portalId: data.portalId,
        pending: true,
        email: data.email,
        fromUrl: data.fromUrl,
        fromUserId: data.fromUserId ?? null,
      },
    });
  }

  async updateCheckoutSessionStatus(
    id: string,
    data: {
      pending: boolean;
      createdUserId?: string | null;
    }
  ) {
    return prisma.portalCheckoutSessionStatus.update({
      where: {
        id,
      },
      data: {
        pending: data.pending,
        createdUserId: data.createdUserId ?? null,
      },
    });
  }
}
