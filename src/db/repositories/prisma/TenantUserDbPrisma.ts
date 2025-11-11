import { prisma } from "@/db/config/prisma/database";
import { ITenantUserDb } from "@/db/interfaces/accounts/ITenantUserDb";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import { TenantUser as TenantUserModel } from "@prisma/client";
export class TenantUserDbPrisma implements ITenantUserDb {
  async getAll(tenantId: string): Promise<TenantUserWithUserDto[]> {
    return await prisma.tenantUser.findMany({
      where: {
        tenantId,
      },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });
  }
  async get({ tenantId, userId }: { tenantId: string; userId: string }): Promise<TenantUserModel | null> {
    return await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });
  }
  async getById(id: string): Promise<TenantUserWithUserDto | null> {
    return await prisma.tenantUser.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          include: {
            roles: { include: { role: true } },
          },
        },
      },
    });
  }
  async count(tenantId: string): Promise<number> {
    return await prisma.tenantUser.count({
      where: { tenantId },
    });
  }
  async countByCreatedAt(tenantId: string, createdAt: { gte: Date; lt: Date }): Promise<number> {
    return await prisma.tenantUser.count({
      where: {
        tenantId,
        createdAt: {
          gte: createdAt.gte,
          lt: createdAt.lt,
        },
      },
    });
  }
  async create(data: { tenantId: string; userId: string; type: number; joined: number; status: number }): Promise<string> {
    const item = await prisma.tenantUser.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        joined: data.joined,
        status: data.status,
      },
    });
    return item.id;
  }
  async del(id: string): Promise<void> {
    await prisma.tenantUser.delete({
      where: { id },
    });
  }
}
