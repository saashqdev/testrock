import { IRowPermissionsDb } from "@/db/interfaces/entityBuilder/IRowPermissionsDb";
import { prisma } from "@/db/config/prisma/database";
import { RowPermissionsWithDetailsDto } from "@/db/models/entityBuilder/RowPermissionsModel";
export class RowPermissionsDbPrisma implements IRowPermissionsDb {
  async getRowPermissions(rowId: string): Promise<RowPermissionsWithDetailsDto[]> {
    return await prisma.rowPermission.findMany({
      where: {
        rowId,
      },
      include: {
        tenant: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        group: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
      },
    });
  }

  async getRowPermissionByTenant(rowId: string, tenantId?: string | null) {
    return await prisma.rowPermission.findFirst({
      where: {
        rowId,
        tenantId,
      },
    });
  }

  async getRowPermissionByGroups(rowId: string, groups: string[]) {
    return await prisma.rowPermission.findFirst({
      where: {
        rowId,
        groupId: {
          in: groups,
        },
      },
    });
  }

  async getRowPermissionByRoles(rowId: string, roles: string[]) {
    return await prisma.rowPermission.findFirst({
      where: {
        rowId,
        roleId: {
          in: roles,
        },
      },
    });
  }

  async getRowPermissionByUsers(rowId: string, users: string[]) {
    return await prisma.rowPermission.findFirst({
      where: {
        rowId,
        userId: {
          in: users,
        },
      },
    });
  }

  async createRowPermission(data: {
    rowId: string;
    tenantId?: string | null;
    roleId?: string | null;
    groupId?: string | null;
    userId?: string | null;
    public?: boolean | null;
    access: string;
  }) {
    return await prisma.rowPermission.create({
      data,
    });
  }

  async updateRowPermission(
    id: string,
    data: {
      access: string;
    }
  ) {
    return await prisma.rowPermission.update({
      where: { id },
      data,
    });
  }

  async deleteRowPermission(rowId: string) {
    return await prisma.rowPermission.deleteMany({
      where: {
        rowId,
      },
    });
  }

  async deleteRowPermissionById(id: string) {
    return await prisma.rowPermission.delete({
      where: {
        id,
      },
    });
  }
}
