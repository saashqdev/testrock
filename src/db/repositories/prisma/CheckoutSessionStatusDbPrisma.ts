import { prisma } from "@/db/config/prisma/database";
import { ICheckoutSessionStatusDb } from "@/db/interfaces/subscriptions/ICheckoutSessionStatusDb";
import { CheckoutSessionStatusModel } from "@/db/models";

export class CheckoutSessionStatusDbPrisma implements ICheckoutSessionStatusDb {
  async get(id: string): Promise<CheckoutSessionStatusModel | null> {
    return prisma.checkoutSessionStatus.findUnique({
      where: { id },
    });
  }

  async create(data: { id: string; email: string; fromUrl: string; fromUserId?: string | null; fromTenantId?: string | null }): Promise<string> {
    const item = await prisma.checkoutSessionStatus.create({
      data: {
        id: data.id,
        pending: true,
        email: data.email,
        fromUrl: data.fromUrl,
        fromUserId: data.fromUserId ?? null,
        fromTenantId: data.fromTenantId ?? null,
      },
    });
    return item.id;
  }

  async update(id: string, data: { pending: boolean; createdUserId?: string | null; createdTenantId?: string | null }): Promise<void> {
    await prisma.checkoutSessionStatus.update({
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
