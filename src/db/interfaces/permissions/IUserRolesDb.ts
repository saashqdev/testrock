import { Prisma } from "@prisma/client";
import { UserRoleWithPermissionDto } from "@/db/models/permissions/UserRolesModel";

export interface IUserRolesDb {
  getUserRole(
    userId: string,
    roleId: string,
    tenantId?: string | null | undefined
  ): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    roleId: string;
    tenantId: string | null;
  } | null>;
  getUserRoleInTenant(
    userId: string,
    tenantId: string,
    roleName: string
  ): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    roleId: string;
    tenantId: string | null;
  } | null>;
  getUserRoleInAdmin(
    userId: string,
    roleName: string
  ): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    roleId: string;
    tenantId: string | null;
  } | null>;
  getUserRoles(userId: string, tenantId?: string | null | undefined): Promise<UserRoleWithPermissionDto[]>;
  getPermissionsByUser(userId: string, tenantId: string | null): Promise<string[]>;
  findPermissionByUser(persmissionName: string, userId: string, tenantId?: string | null | undefined): Promise<string | null>;
  countUserPermission(userId: string, tenantId: string | null, permissionName: string): Promise<number>;
  findUserRolesByIds(
    userId: string,
    tenantId: string | null,
    roleIds: string[]
  ): Promise<
    {
      id: string;
      createdAt: Date;
      userId: string;
      roleId: string;
      tenantId: string | null;
    }[]
  >;
  getUsersRolesInTenant(tenantId: string): Promise<
    ({
      role: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string;
        type: string;
        assignToNewUsers: boolean;
        isDefault: boolean;
        order: number;
      };
      user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        phone: string | null;
        defaultTenantId: string | null;
        verifyToken: string | null;
        githubId: string | null;
        googleId: string | null;
        locale: string | null;
        active: boolean;
      };
    } & {
      id: string;
      createdAt: Date;
      userId: string;
      roleId: string;
      tenantId: string | null;
    })[]
  >;
  createUserRole(
    userId: string,
    roleId: string,
    tenantId?: string | null
  ): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    roleId: string;
    tenantId: string | null;
  }>;
  createUserRoles(
    userId: string,
    roles: {
      id: string;
      tenantId: string | null;
    }[]
  ): Promise<Prisma.BatchPayload>;
  deleteUserRole(userId: string, roleId: string, tenantId?: string | null): Promise<Prisma.BatchPayload>;
  deleteAllUserRoles(userId: string, type: string): Promise<Prisma.BatchPayload>;
  deleteAllByUser(userId: string, type: string): Promise<void>;
}
