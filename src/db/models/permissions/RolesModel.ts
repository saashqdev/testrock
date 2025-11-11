import { UserDto } from "..";
import { Role, RolePermission, UserRole, Permission } from "@prisma/client";

export type RolesModel = {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    type: string;
    assignToNewUsers: boolean;
    isDefault: boolean;
    order: number;
}

export type RoleWithPermissionsDto = Role & {
  permissions: (RolePermission & { permission: Permission })[];
};

export type RoleWithPermissionsAndUsersDto = RoleWithPermissionsDto & {
  users: (UserRole & { user: UserDto })[];
};
