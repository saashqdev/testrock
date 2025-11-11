import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { RoleWithPermissionsAndUsersDto, RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { Role } from "@prisma/client";

export interface IRolesDb {
  getAllRoles(type?: "admin" | "app" | undefined): Promise<RoleWithPermissionsDto[]>;
  getAllRolesNames(): Promise<{ id: string; name: string }[]>;
  getAllRolesWithoutPermissions(type?: "admin" | "app"): Promise<Role[]>;
  getAllRolesWithUsers(type?: "admin" | "app", filters?: FiltersDto): Promise<RoleWithPermissionsAndUsersDto[]>;
  getRoles(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]>;
  getRolesByName(names: string[]): Promise<RoleWithPermissionsAndUsersDto[]>;
  getRole(id: string): Promise<RoleWithPermissionsDto | null>;
  getRoleByName(name: string): Promise<RoleWithPermissionsDto | null>;
  getNextRolesOrder(type?: "admin" | "app"): Promise<number>;
  createRole(data: { order: number; name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean; isDefault: boolean }): Promise<Role>;
  updateRole(id: string, data: { name: string; description: string; type: "admin" | "app"; assignToNewUsers: boolean }): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  getAllWithUsers(
    filters?:
      | {
          type?: "admin" | "app" | undefined;
          name?: string | undefined;
          description?: string | undefined;
          permissionId?: string | null | undefined;
        }
      | undefined
  ): Promise<RoleWithPermissionsAndUsersDto[]>;
  getAllInIds(ids: string[]): Promise<RoleWithPermissionsAndUsersDto[]>;
}
