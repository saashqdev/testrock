import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import {
  CreatePermissionDto,
  CreateRoleDto,
  defaultAdminRoles,
  defaultAppRoles,
  defaultPermissions,
  seedRolesAndPermissions,
} from "@/utils/services/rolesAndPermissionsService";

export type LoaderData = {
  title: string;
  roles: {
    all: CreateRoleDto[];
    missing: CreateRoleDto[];
  };
  permissions: {
    all: CreatePermissionDto[];
    missing: CreatePermissionDto[];
  };
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  await verifyUserHasPermission("admin.roles.view");
  const roles: { all: CreateRoleDto[]; missing: CreateRoleDto[] } = {
    all: [...defaultAppRoles, ...defaultAdminRoles],
    missing: [],
  };
  const createdRoles = await db.roles.getAllRolesNames();
  roles.all.forEach((role) => {
    const existing = createdRoles.find((r) => r.name === role.name);
    if (!existing) {
      roles.missing.push(role);
    }
  });

  const permissions: { all: CreatePermissionDto[]; missing: CreatePermissionDto[] } = {
    all: defaultPermissions,
    missing: [],
  };
  const createdPermissions = await db.permissions.getAllPermissionsIdsAndNames();
  permissions.all.forEach((permission) => {
    const existing = createdPermissions.find((r) => r.name === permission.name);
    if (!existing) {
      permissions.missing.push(permission);
    }
  });
  const data: LoaderData = {
    title: `Seed | ${process.env.APP_NAME}`,
    roles,
    permissions,
  };
  return data;
};

export type ActionData = {
  success?: string;
  error?: string;
};

export const action = async (formData: FormData, props?: IServerComponentsProps): Promise<ActionData> => {
  await verifyUserHasPermission("admin.roles.update");
  const { t } = await getServerTranslations();
  const actionType = formData.get("action");
  
  if (actionType === "seed") {
    try {
      await seedRolesAndPermissions();
      return { success: "Roles and permissions seeded successfully" };
    } catch (e: any) {
      return { error: e.message };
    }
  } else {
    return { error: t("shared.invalidForm") };
  }
};

