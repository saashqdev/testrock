import { IUserRolesDb } from "@/db/interfaces/permissions/IUserRolesDb";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { UserRoleWithPermissionDto } from "@/db/models/permissions/UserRolesModel";
import { UserRole } from "@prisma/client";

export class UserRolesDbPrisma implements IUserRolesDb {
  async getUserRole(userId: string, roleId: string, tenantId?: string | null) {
    return await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        tenantId,
      },
    });
  }

  async getUserRoleInTenant(userId: string, tenantId: string, roleName: string) {
    return await prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: roleName,
        },
        tenantId,
      },
    });
  }

  async getUserRoleInAdmin(userId: string, roleName: string) {
    return await cachified({
      key: `userRole:${userId}:${roleName}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.userRole.findFirst({
          where: {
            userId,
            role: {
              name: roleName,
            },
            tenantId: null,
          },
        }),
    });
  }

  async getUserRoles(userId: string, tenantId?: string | null): Promise<UserRoleWithPermissionDto[]> {
    return await prisma.userRole.findMany({
      where: {
        userId,
        tenantId,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      orderBy: {
        role: {
          order: "asc",
        },
      },
    });
  }

  async getPermissionsByUser(userId: string, tenantId: string | null): Promise<string[]> {
    const userRoles = await cachified({
      key: `userRoles:${userId}:${tenantId}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.userRole.findMany({
          where: { userId, tenantId },
          include: { role: { include: { permissions: { include: { permission: { select: { name: true } } } } } } },
        }),
    });
    const roles: string[] = [];
    const names: string[] = [];
    userRoles.forEach((userRoles) => {
      if (!roles.includes(userRoles.role.name)) {
        roles.push(userRoles.role.name);
      }
      userRoles.role.permissions.forEach((permission) => {
        if (!names.includes(permission.permission.name)) {
          names.push(permission.permission.name);
        }
      });
    });
    // console.log({
    //   userId,
    //   tenantId,
    //   roles,
    //   permissions: names,
    // });
    return names;
  }

  async findPermissionByUser(persmissionName: string, userId: string, tenantId?: string | null): Promise<string | null> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId, tenantId, role: { permissions: { some: { permission: { name: persmissionName } } } } },
      include: { role: { include: { permissions: { include: { permission: { select: { name: true } } } } } } },
    });
    const roles: string[] = [];
    const names: string[] = [];
    userRoles.forEach((userRoles) => {
      if (!roles.includes(userRoles.role.name)) {
        roles.push(userRoles.role.name);
      }
      userRoles.role.permissions.forEach((permission) => {
        if (!names.includes(permission.permission.name)) {
          names.push(permission.permission.name);
        }
      });
    });
    // console.log({
    //   userId,
    //   tenantId,
    //   roles,
    //   permissions: names,
    // });
    return names.length > 0 ? names[0] : null;
  }

  async countUserPermission(userId: string, tenantId: string | null, permissionName: string): Promise<number> {
    const normal = await prisma.permission.count({
      where: {
        name: permissionName,
        inRoles: { some: { role: { users: { some: { userId, tenantId } } } } },
      },
    });
    if (normal > 0) {
      return normal;
    }
    return 0;
  }

  async findUserRolesByIds(userId: string, tenantId: string | null, roleIds: string[]): Promise<UserRole[]> {
    return await prisma.userRole.findMany({
      where: {
        userId,
        tenantId,
        roleId: {
          in: roleIds,
        },
      },
    });
  }

  async getUsersRolesInTenant(tenantId: string) {
    return await prisma.userRole.findMany({
      where: {
        tenantId,
      },
      include: {
        role: true,
        user: true,
      },
    });
  }

  async createUserRole(userId: string, roleId: string, tenantId: string | null = null) {
    const existing = await db.userRoles.getUserRole(userId, roleId, tenantId);
    if (existing) {
      return existing;
    }
    return await prisma.userRole
      .create({
        data: {
          userId,
          roleId,
          tenantId,
        },
      })
      .then((item) => {
        clearCacheKey(`userRoles:${userId}:${tenantId}`);
        return item;
      });
  }

  async createUserRoles(userId: string, roles: { id: string; tenantId: string | null }[]) {
    const uniqueTenantIds = [...new Set(roles.map((role) => role.tenantId))];
    return await prisma.userRole
      .createMany({
        data: roles.map((role) => ({
          userId,
          roleId: role.id,
          tenantId: role.tenantId,
        })),
      })
      .then((item) => {
        uniqueTenantIds.forEach((tenantId) => {
          clearCacheKey(`userRoles:${userId}:${tenantId}`);
        });
        return item;
      });
  }

  async deleteUserRole(userId: string, roleId: string, tenantId: string | null = null) {
    return await prisma.userRole
      .deleteMany({
        where: {
          userId,
          roleId,
        },
      })
      .then((item) => {
        clearCacheKey(`userRoles:${userId}:${tenantId}`);
        return item;
      });
  }

  async deleteAllUserRoles(userId: string, type: string) {
    return await prisma.userRole.deleteMany({
      where: {
        userId,
        role: {
          type,
        },
      },
    });
  }

  async deleteAllByUser(userId: string, type: string): Promise<void> {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        role: {
          type,
        },
      },
    });
  }
}
