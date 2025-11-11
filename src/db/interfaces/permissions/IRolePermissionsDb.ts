import { Prisma } from "@prisma/client";
import { RolePermissionsWithPermissionDto } from "@/db/models/permissions/RolePermissionsModel";

export interface IRolePermissionsDb {
  getAllRolePermissions(): Promise<
    ({
      permission: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        type: string;
        isDefault: boolean;
        order: number;
        entityId: string | null;
      };
    } & {
      id: string;
      roleId: string;
      permissionId: string;
    })[]
  >;
  createRolePermission(data: { roleId: string; permissionId: string }): Promise<{
    id: string;
    roleId: string;
    permissionId: string;
  }>;
  setRolePermissions(roleId: string, permissionNames: string[]): Promise<void>;
  setPermissionRoles(permissionId: string, roleNames: string[]): Promise<void>;
  deleteRolePermission(roleId: string, permissionId: string): Promise<Prisma.BatchPayload>;
  deleteRolePermissionById(id: string): Promise<{
    id: string;
    roleId: string;
    permissionId: string;
  }>;
  getRolePermission(roleId: string, permissionId: string): Promise<RolePermissionsWithPermissionDto | null>;
}
