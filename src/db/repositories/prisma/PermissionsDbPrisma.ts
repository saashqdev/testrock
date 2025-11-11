import { IPermissionsDb } from "@/db/interfaces/permissions/IPermissionsDb";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { Prisma, Entity } from "@prisma/client";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { getEntityPermissions } from "@/lib/helpers/PermissionsHelper";

export class PermissionsDbPrisma implements IPermissionsDb {
  async getAllPermissions(type?: string, filters?: FiltersDto): Promise<PermissionsWithRolesDto[]> {
    let where: any = {
      type,
    };
    if (filters) {
      where = RowFiltersHelper.getFiltersCondition(filters);
      const roleId = filters?.properties.find((f) => f.name === "roleId")?.value;
      if (roleId) {
        where = {
          OR: [where, { inRoles: { some: { roleId } } }],
        };
      }
      if (type !== undefined) {
        where = {
          AND: [type, where],
        };
      }
    }

    return await prisma.permission.findMany({
      where,
      include: {
        inRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  async getAllPermissionsIdsAndNames(): Promise<{ id: string; name: string }[]> {
    return await prisma.permission.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  async getPermission(id: string): Promise<PermissionsWithRolesDto | null> {
    return await prisma.permission.findUnique({
      where: {
        id,
      },
      include: {
        inRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getPermissionByName(name: string): Promise<PermissionsWithRolesDto | null> {
    return await prisma.permission.findUnique({
      where: {
        name,
      },
      include: {
        inRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getPermissionName(name: string): Promise<{ id: string; name: string; description: string } | null> {
    return await cachified({
      key: `permission:${name}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.permission.findUnique({
          where: {
            name,
          },
          select: { id: true, name: true, description: true },
        }),
    });
  }

  async getPermissionByNames(names: string[]): Promise<PermissionsWithRolesDto[]> {
    return await prisma.permission.findMany({
      where: {
        name: {
          in: names,
        },
      },
      include: {
        inRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getNextPermissionsOrder(type?: string): Promise<number> {
    let where = {};
    if (type !== undefined) {
      where = {
        type,
      };
    }
    return (
      ((
        await prisma.permission.aggregate({
          where,
          _max: {
            order: true,
          },
        })
      )._max.order ?? 0) + 1
    );
  }

  async createPermissions(
    permissions: { inRoles: string[]; name: string; description: string; type: string; entityId?: string | null }[],
    fromOrder: number = 0
  ) {
    const allRolePermissions = await db.rolePermissions.getAllRolePermissions();
    let allPermissions = await this.getAllPermissions();
    let createdPermissions: string[] = [];
    await Promise.all(
      permissions.map(async (data, idx) => {
        const existing = allPermissions.find((p) => p.name === data.name);
        if (existing || createdPermissions.includes(data.name)) {
          // eslint-disable-next-line no-console
          console.log("ℹ️ Permission already exists", data.name);
          return;
        }
        const permission = await this.createPermission({
          order: fromOrder + idx + 1,
          name: data.name,
          description: data.description,
          type: data.type,
          isDefault: true,
          entityId: data.entityId ?? null,
        });
        createdPermissions.push(permission.name);

        await Promise.all(
          data.inRoles.map(async (inRole) => {
            const role = await db.roles.getRoleByName(inRole);
            if (!role) {
              throw new Error("Role required: " + inRole);
            }
            const existing = allRolePermissions.find((p) => p.roleId === role.id && p.permission.name === permission.name);
            if (existing) {
              return existing;
            }
            return await db.rolePermissions.createRolePermission({
              permissionId: permission.id,
              roleId: role.id,
            });
          })
        );
      })
    );
  }

  async createPermission(data: { order: number; name: string; description: string; type: string; isDefault: boolean; entityId: string | null }) {
    return await prisma.permission.create({
      data,
    });
  }

  async updatePermission(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: string;
      order?: number;
    }
  ) {
    return await prisma.permission
      .update({
        where: { id },
        data,
      })
      .then((item) => {
        clearCacheKey(`permission:${item.name}`);
        return item;
      });
  }

  async deletePermission(id: string) {
    return await prisma.permission
      .delete({
        where: { id },
      })
      .then((item) => {
        clearCacheKey(`permission:${item.name}`);
        return item;
      });
  }

  async deleteEntityPermissions(entity: Entity) {
    const entityPermissions = await getEntityPermissions(entity);
    const names = entityPermissions.map((p) => p.name);
    if (names.length > 0) {
      return await prisma.permission.deleteMany({
        where: {
          name: {
            in: names,
          },
        },
      });
    }
  }

  async createEntityPermissions(entity: Entity) {
    const allUserRoles = await db.roles.getAllRolesNames();
    // const assignToAllUserRoles = allUserRoles.filter((f) => f.assignToNewUsers);
    const entityPermissions = await getEntityPermissions(entity);
    await Promise.all(
      entityPermissions.map(async (permission, idx) => {
        const entityPermission = {
          inRoles: allUserRoles.map((f) => f.name),
          name: permission.name,
          description: permission.description,
          type: "app",
          entityId: entity.id,
        };
        return await this.createPermissions([entityPermission], allUserRoles.length + idx + 1);
      })
    );
  }

  async getAll(filters?: { type?: string; roleId?: string | null }): Promise<PermissionsWithRolesDto[]> {
    let where: Prisma.PermissionWhereInput = {};
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.roleId) {
      where.inRoles = { some: { roleId: filters.roleId } };
    }

    return await prisma.permission.findMany({
      where,
      include: {
        inRoles: {
          include: { role: true },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }
}
