"use server";

import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithRolesDto } from "@/db/models/accounts/UsersModel";
import { Tenant } from "@prisma/client";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import AdminAccountUsersFromTenantClient from "./account-users.$account.client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  title: string;
  tenant: Tenant;
  items: UserWithRolesDto[];
  roles: RoleWithPermissionsDto[];
};

async function loader(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.set");
  const { t } = await getServerTranslations();

  const tenant = await db.tenants.getTenant(params.account!);
  if (!tenant) {
    redirect("/admin/accounts/roles-and-permissions/account-users");
  }

  const adminUsers = (await db.users.adminGetAllUsers()).items.filter((f) => f.admin);
  const tenantUsers = await db.users.adminGetAllTenantUsers(params.account ?? "");
  const roles = await db.roles.getAllRoles("app");

  const items: UserWithRolesDto[] = [];
  adminUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });

  const data: LoaderData = {
    title: `${t("models.role.adminRoles")} | ${process.env.APP_NAME}`,
    items,
    roles,
    tenant,
  };
  return data;
}

type ActionData = {
  error?: string;
};

async function handleAction(props: IServerComponentsProps, prev: any, formData: FormData): Promise<ActionData> {
  "use server";

  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.set");
  const { t } = await getServerTranslations();

  const action = formData.get("action")?.toString() ?? "";
  if (action === "edit") {
    const userId = formData.get("user-id")?.toString() ?? "";
    const roleId = formData.get("role-id")?.toString() ?? "";
    const add = formData.get("add") === "true";

    const tenant = await db.tenants.getTenant(params.account ?? "");
    const user = await db.users.getUser(userId);
    const role = await db.roles.getRole(roleId);

    if (add) {
      await db.userRoles.createUserRole(userId, roleId, params.account);
      // Note: createAdminLog needs to be adapted for Next.js or use a different logging approach
      // await db.logs.createAdminLog(request, "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      await db.userRoles.deleteUserRole(userId, roleId, params.account);
      // await db.logs.createAdminLog(request, "Deleted", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    }

    return {};
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function AdminAccountUsersFromTenant(props: IServerComponentsProps) {
  const data = await loader(props);

  // Create a bound action that includes props
  const action = handleAction.bind(null, props);

  return <AdminAccountUsersFromTenantClient data={data} action={action} />;
}
