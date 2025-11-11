import { IGroupsDb } from "@/db/interfaces/permissions/IGroupsDb";
import { prisma } from "@/db/config/prisma/database";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";

export class GroupsDbPrisma implements IGroupsDb {
  async getAllGroups(tenantId: string | null): Promise<GroupWithDetailsDto[]> {
    return await prisma.group.findMany({
      where: {
        tenantId,
      },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            groupId: true,
            user: {
              select: {
                id: true,
                createdAt: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true,
                githubId: true,
                googleId: true,
                locale: true,
                admin: true,
                defaultTenantId: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
  }

  async getGroups(tenantId: string | null, ids: string[]): Promise<GroupWithDetailsDto[]> {
    return await prisma.group.findMany({
      where: {
        tenantId,
        id: {
          in: ids,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            groupId: true,
            user: {
              select: {
                id: true,
                createdAt: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true,
                githubId: true,
                googleId: true,
                locale: true,
                admin: true,
                defaultTenantId: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
  }

  async getMyGroups(userId: string, tenantId: string | null): Promise<GroupWithDetailsDto[]> {
    return await prisma.group.findMany({
      where: {
        tenantId,
        OR: [
          {
            createdByUserId: userId,
          },
          {
            users: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            groupId: true,
            user: {
              select: {
                id: true,
                createdAt: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true,
                githubId: true,
                googleId: true,
                locale: true,
                admin: true,
                defaultTenantId: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });
  }

  async getGroup(id: string): Promise<GroupWithDetailsDto | null> {
    return await prisma.group.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            groupId: true,
            user: {
              select: {
                id: true,
                createdAt: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true,
                githubId: true,
                googleId: true,
                locale: true,
                admin: true,
                defaultTenantId: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async createGroup(data: { createdByUserId: string; tenantId: string | null; name: string; description: string; color: number }) {
    return await prisma.group.create({
      data,
    });
  }

  async updateGroup(id: string, data: { name: string; description: string; color: number }) {
    return await prisma.group.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteGroup(id: string) {
    return await prisma.group.delete({
      where: {
        id,
      },
    });
  }
}
