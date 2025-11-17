"use server";

import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithRolesDto, UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { getUserInfo } from "@/lib/services/session.server";
import EventsService from "@/modules/events/services/server/EventsService";
import { RoleAssignedDto } from "@/modules/events/dtos/RoleAssignedDto";
import { RoleUnassignedDto } from "@/modules/events/dtos/RoleUnassignedDto";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

type LoaderData = {
  items: UserWithRolesDto[];
  roles: RoleWithPermissionsDto[];
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.role.adminRoles")} | ${defaultSiteTags.title}`,
  });
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenant = await getTenantIdFromUrl(params?.tenant!);
  const tenantId = tenant.id;

  const tenantUsers = await db.users.adminGetAllTenantUsers(tenantId);
  const roles = await db.roles.getAllRoles("app");

  const items: UserWithRolesDto[] = [];
  tenantUsers.forEach((user) => {
    if (!items.find((f) => f.id === user.id)) {
      items.push(user);
    }
  });

  const data: LoaderData = {
    items,
    roles,
  };
  return data;
};

type ActionData = {
  error?: string;
};

export const actionRolesAndPermissionsUsers = async (prev: any, form: FormData) => {
  await requireAuth();
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const fromUser = await db.users.getUser(userInfo.userId);
  if (!fromUser) {
    return { error: "Invalid user" };
  }

  const action = form.get("action")?.toString() ?? "";
  const tenantSlug = form.get("tenant")?.toString();
  if (!tenantSlug) {
    return { error: "Invalid tenant" };
  }
  const tenant = await getTenantIdFromUrl(tenantSlug);
  const tenantId = tenant.id;
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const tenant = await db.tenants.getTenant(tenantId);
    const user = await db.users.getUser(userId);
    const role = await db.roles.getRole(roleId);

    if (add) {
      await db.userRoles.createUserRole(userId, roleId, tenantId);
      if (fromUser && user && role) {
        await EventsService.create({
          event: "role.assigned",
          tenantId: tenant?.id ?? null,
          userId: fromUser.id,
          data: {
            fromUser: { id: fromUser.id, email: fromUser.email },
            toUser: { id: user.id, email: user.email },
            role: { id: role.id, name: role.name, description: role.description },
          } satisfies RoleAssignedDto,
        });
      }
      await db.logs.createManualLog(fromUser.id, tenant?.id ?? null, "", "Created", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    } else {
      if (fromUser && user && role) {
        await EventsService.create({
          event: "role.unassigned",
          tenantId: tenant?.id ?? null,
          userId: fromUser.id,
          data: {
            fromUser: { id: fromUser.id, email: fromUser.email },
            toUser: { id: user.id, email: user.email },
            role: { id: role.id, name: role.name, description: role.description },
          } satisfies RoleUnassignedDto,
        });
      }
      await db.userRoles.deleteUserRole(userId, roleId, tenantId);
      await db.logs.createManualLog(fromUser.id, tenant?.id ?? null, "", "Deleted", `[${tenant?.name}] ${user?.email} - ${role?.name}}`);
    }

    return { success: true };
  } else {
    return { error: t("shared.invalidForm") };
  }
};

export default async function (props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} />;
}
