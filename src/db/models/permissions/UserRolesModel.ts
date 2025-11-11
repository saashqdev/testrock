import { UserRole, Role, RolePermission, Permission } from "@prisma/client";

export type UserRoleModel = {
  id: string;
  createdAt: Date;
  userId: string;
  roleId: string;
  tenantId: string | null;
};

export type UserRoleWithPermissionDto = UserRole & {
  role: Role & { permissions: (RolePermission & { permission: Permission })[] };
};
