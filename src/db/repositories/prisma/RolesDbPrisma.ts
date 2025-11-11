import { prisma } from "@/db/config/prisma/database";
import { IRolesDb } from "@/db/interfaces/permissions/IRolesDb";
import { Prisma, Role } from "@prisma/client";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { RoleWithPermissionsDto, RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";

export class RolesDbPrisma implements IRolesDb {
  async getAllRoles(type?: "admin" | "app"): Promise<RoleWithPermissionsDto[]> {
    let where = {};
    if (type !== undefined) {
      where = {
        type,
      };
    }

    return await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
      },
      orderBy: [
        {
          type: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  }

  async getAllRolesNames(): Promise<{ id: string; name: string }[]> {
    return await prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });
  }

  async getAllRolesWithoutPermissions(type?: "admin" | "app"): Promise<Role[]> {
    let where = {};
    if (type !== undefined) {
      where = {
        type,
      };
    }

    return await cachified({
      key: `roles:${type}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.role.findMany({
          where,
          orderBy: [
            {
              type: "asc",
            },
            {
              order: "asc",
            },
          ],
        }),
    });
  }

  async getAllRolesWithUsers(type?: "admin" | "app", filters?: FiltersDto): Promise<RoleWithPermissionsAndUsersDto[]> {
    let where: any = {
      type,
    };
    if (filters !== undefined) {
      where = RowFiltersHelper.getFiltersCondition(filters);
      const permissionId = filters?.properties.find((f) => f.name === "permissionId")?.value;
      if (permissionId) {
        where = {
          OR: [where, { permissions: { some: { permissionId } } }],
        };
      }
      if (type !== undefined) {
        where = {
          AND: [type, where],
        };
      }
    }
    return await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
        users: {
          include: {
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
          type: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  }

  async getRoles(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]> {
    return await prisma.role.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
        users: {
          include: {
            ...UserModelHelper.includeSimpleUser,
          },
        },
      },
    });
  }

  async getRolesByName(names: string[]): Promise<RoleWithPermissionsAndUsersDto[]> {
    return await prisma.role.findMany({
      where: {
        name: {
          in: names,
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
        users: {
          include: {
            ...UserModelHelper.includeSimpleUser,
          },
        },
      },
    });
  }

  async getRole(id: string): Promise<RoleWithPermissionsDto | null> {
    return await prisma.role.findUnique({
      where: {
        id,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
      },
    });
  }

  async getRoleByName(name: string): Promise<RoleWithPermissionsDto | null> {
    return await prisma.role.findUnique({
      where: {
        name,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
      },
    });
  }

  async getNextRolesOrder(type?: "admin" | "app"): Promise<number> {
    let where = {};
    if (type !== undefined) {
      where = {
        type,
      };
    }
    return (
      ((
        await prisma.role.aggregate({
          where,
          _max: {
            order: true,
          },
        })
      )._max.order ?? 0) + 1
    );
  }

  async createRole(data: { order: number; name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean; isDefault: boolean }) {
    return await prisma.role
      .create({
        data,
      })
      .then((item) => {
        clearCacheKey(`roles:${data.type}`);
        return item;
      });
  }

  async updateRole(id: string, data: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }) {
    return await prisma.role
      .update({
        where: { id },
        data,
      })
      .then((item) => {
        clearCacheKey(`roles:${item.type}`);
        return item;
      });
  }

  async deleteRole(id: string): Promise<void> {
    await prisma.role
      .delete({
        where: { id },
      })
      .then((item) => {
        clearCacheKey(`roles:${item.type}`);
      });
  }

  async getAllWithUsers(filters?: {
    type?: "admin" | "app";
    name?: string;
    description?: string;
    permissionId?: string | null;
  }): Promise<RoleWithPermissionsAndUsersDto[]> {
    let where: Prisma.RoleWhereInput = {
      name: filters?.name ? { contains: filters.name } : undefined,
      description: filters?.description ? { contains: filters.description } : undefined,
    };
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.permissionId) {
      where = {
        OR: [where, { permissions: { some: { permissionId: filters.permissionId } } }],
      };
    }
    return await prisma.role.findMany({
      where,
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
        users: {
          include: {
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
          type: "asc",
        },
        {
          order: "asc",
        },
      ],
    });
  }

  async getAllInIds(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]> {
    return await prisma.role.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
          orderBy: { permission: { name: "asc" } },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                admin: true,
                defaultTenantId: true,
                locale: true,
                avatar: true,
                phone: true,
                githubId: true,
                googleId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }
}
