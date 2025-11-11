import { PortalUserDto } from "@/modules/portals/dtos/PortalUserDto";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { prisma } from "@/db/config/prisma/database";

import { IPortalUsersDb } from "@/db/interfaces/portals/IPortalUsersDb";
export class PortalUsersDbPrisma implements IPortalUsersDb {
  async getPortalUserById(portalId: string, id: string): Promise<PortalUserDto | null> {
    return await cachified({
      key: `portalUser:${portalId}:${id}`,
      ttl: 60 * 60 * 24,
      getFreshValue: async () => {
        return prisma.portalUser.findUnique({
          where: {
            portalId,
            id,
          },
          select: {
            id: true,
            portalId: true,
            createdAt: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });
      },
    });
  }

  async getPortalUserByEmail(portalId: string, email: string): Promise<PortalUserDto | null> {
    return await cachified({
      key: `portalUserByEmail:${portalId}:${email}`,
      ttl: 60 * 60 * 24,
      getFreshValue: async () => {
        return prisma.portalUser.findUnique({
          where: {
            portalId_email: {
              portalId,
              email,
            },
          },
          select: {
            id: true,
            portalId: true,
            createdAt: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });
      },
    });
  }

  async getPortalUsers(portalId: string): Promise<PortalUserDto[]> {
    return await prisma.portalUser.findMany({
      where: {
        portalId,
      },
      select: {
        id: true,
        createdAt: true,
        portalId: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createPortalUser(data: {
    tenantId: string | null;
    portalId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }) {
    return await prisma.portalUser.create({
      data: {
        tenantId: data.tenantId,
        portalId: data.portalId,
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
    });
  }

  async updatePortalUser(
    id: string,
    data: {
      email?: string;
      passwordHash?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
    }
  ) {
    return await prisma.portalUser
      .update({
        where: {
          id,
        },
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data.avatar,
        },
      })
      .then((item) => {
        clearCacheKey(`portalUser:${item.portalId}:${id}`);
        clearCacheKey(`portalUserByEmail:${item.portalId}:${item.email}`);
        return item;
      });
  }

  async deletePortalUser(portalId: string, id: string) {
    return await prisma.portalUser.delete({
      where: {
        portalId,
        id,
      },
    });
  }

  async countPortalUsersByTenantId(tenantId: string | null): Promise<number> {
    return await prisma.portalUser.count({
      where: {
        tenantId,
      },
    });
  }

  async getPortalUserPasswordHash(id: string): Promise<string | null> {
    const user = await prisma.portalUser.findUnique({
      where: {
        id,
      },
      select: {
        passwordHash: true,
      },
    });
    return user?.passwordHash ?? null;
  }

  async updatePortalUserPassword(id: string, data: { passwordHash: string }) {
    return await prisma.portalUser.update({
      where: { id },
      data: {
        passwordHash: data.passwordHash,
      },
    });
  }
}
