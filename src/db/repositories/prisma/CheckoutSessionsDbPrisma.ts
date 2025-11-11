import { ICheckoutSessionsDb } from "@/db/interfaces/subscriptions/ICheckoutSessionsDb";
import { prisma } from "@/db/config/prisma/database";
export class CheckoutSessionsDbPrisma implements ICheckoutSessionsDb {
  async getCheckoutSessionStatus(id: string) {
    return prisma.checkoutSessionStatus.findUnique({
      where: { id },
    });
  }

  async createCheckoutSessionStatus(data: { id: string; email: string; fromUrl: string; fromUserId?: string | null; fromTenantId?: string | null }) {
    return prisma.checkoutSessionStatus.create({
      data: {
        id: data.id,
        pending: true,
        email: data.email,
        fromUrl: data.fromUrl,
        fromUserId: data.fromUserId ?? null,
        fromTenantId: data.fromTenantId ?? null,
      },
    });
  }

  async updateCheckoutSessionStatus(
    id: string,
    data: {
      pending: boolean;
      createdUserId?: string | null;
      createdTenantId?: string | null;
    }
  ) {
    return prisma.checkoutSessionStatus.update({
      where: {
        id,
      },
      data: {
        pending: data.pending,
        createdUserId: data.createdUserId ?? null,
        createdTenantId: data.createdTenantId ?? null,
      },
    });
  }
}
