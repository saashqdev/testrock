import { Permission } from "@prisma/client";

export type RolePermissionsModel = {
  id: string;
  roleId: string;
  permissionId: string;
};

export type RolePermissionsWithPermissionDto = RolePermissionsModel & {
  permission: Permission;
};
