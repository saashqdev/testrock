import { RowPermissionsWithDetailsDto } from "@/db/models/entityBuilder/RowPermissionsModel";
import { Prisma } from "@prisma/client";

export interface IRowPermissionsDb {
  getRowPermissions(rowId: string): Promise<RowPermissionsWithDetailsDto[]>;
  getRowPermissionByTenant(
    rowId: string,
    tenantId?: string | null | undefined
  ): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  } | null>;
  getRowPermissionByGroups(
    rowId: string,
    groups: string[]
  ): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  } | null>;
  getRowPermissionByRoles(
    rowId: string,
    roles: string[]
  ): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  } | null>;
  getRowPermissionByUsers(
    rowId: string,
    users: string[]
  ): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  } | null>;
  createRowPermission(data: {
    rowId: string;
    tenantId?: string | null | undefined;
    roleId?: string | null | undefined;
    groupId?: string | null | undefined;
    userId?: string | null | undefined;
    public?: boolean | null | undefined;
    access: string;
  }): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  }>;
  updateRowPermission(
    id: string,
    data: {
      access: string;
    }
  ): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  }>;
  deleteRowPermission(rowId: string): Promise<Prisma.BatchPayload>;
  deleteRowPermissionById(id: string): Promise<{
    id: string;
    rowId: string;
    tenantId: string | null;
    roleId: string | null;
    groupId: string | null;
    userId: string | null;
    public: boolean | null;
    access: string;
  }>;
}
