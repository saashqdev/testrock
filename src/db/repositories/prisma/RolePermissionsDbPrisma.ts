import { IRolePermissionsDb } from "@/db/interfaces/permissions/IRolePermissionsDb";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { clearCacheKey } from "@/lib/services/cache.server";
import { RolePermissionsWithPermissionDto } from "@/db/models/permissions/RolePermissionsModel";

export class RolePermissionsDbPrisma implements IRolePermissionsDb {
  async getAllRolePermissions() {
    return await prisma.rolePermission.findMany({
      include: {
        permission: true,
      },
    });
  }

  async createRolePermission(data: { roleId: string; permissionId: string }) {
    const existing = await prisma.rolePermission.findFirst({
      where: {
        roleId: data.roleId,
        permissionId: data.permissionId,
      },
    });
    if (existing) {
      return existing;
    }
    return await prisma.rolePermission.create({
      data,
    });
  }

  async setRolePermissions(roleId: string, permissionNames: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return;
    }
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    permissionNames.map(async (name) => {
      const permission = await db.permissions.getPermissionName(name);
      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId,
            permissionId: permission.id,
          },
        });
      }
    });

    clearCacheKey(`roles:${role.type}`);
    if (role.type === "app") {
      // eslint-disable-next-line no-console
      const allTenants = await db.tenant.adminGetAllTenants();
      // eslint-disable-next-line no-console
      console.log(`[Permissions] Clearing user roles cache for ${allTenants.length} tenants`);
      for (const tenant of allTenants) {
        for (const user of tenant.users) {
          clearCacheKey(`userRoles:${user.userId}:${tenant.id}`);
        }
      }
    }

    const allUsers = await db.users.adminGetAllUsersNames();
    for (const user of allUsers) {
      clearCacheKey(`userRole:${user.id}:${role.name}`);
    }
  }

  async setPermissionRoles(permissionId: string, roleNames: string[]) {
    await prisma.rolePermission.deleteMany({
      where: { permissionId },
    });

    roleNames.map(async (name) => {
      const role = await db.roles.getRoleByName(name);
      if (role) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId,
          },
        });
      }
    });
  }

  async deleteRolePermission(roleId: string, permissionId: string) {
    return await prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });
  }

  async deleteRolePermissionById(id: string) {
    return await prisma.rolePermission.delete({
      where: { id },
    });
  }

  async getRolePermission(roleId: string, permissionId: string): Promise<RolePermissionsWithPermissionDto | null> {
    return await prisma.rolePermission
      .findFirstOrThrow({
        where: {
          roleId,
          permissionId,
        },
        include: {
          permission: true,
        },
      })
      .catch(() => null);
  }
}
