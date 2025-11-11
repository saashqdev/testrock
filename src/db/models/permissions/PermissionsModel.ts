import { Permission, RolePermission, Role } from "@prisma/client";

export type PermissionsModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  type: string;
  isDefault: boolean;
  order: number;
};

export type PermissionsWithRolesDto = Permission & {
  inRoles: (RolePermission & { role: Role })[];
};
