"use server";

import { getTenantIdFromUrl } from "@/modules/accounts/services/TenantService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { PermissionsModel, TenantUserInvitationsModel } from "@/db/models";
import { getUser } from "@/modules/accounts/services/UserService";
import { getUserInfo } from "@/lib/services/session.server";
import { AppRoleEnum } from "@/modules/permissions/enums/AppRoleEnum";
import { RoleWithPermissionsDto } from "@/db/models";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import { getBaseURL } from "@/lib/services/url.server";
import { db } from "@/db";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { requireTenantSlug } from "@/lib/services/url.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";
import { revalidatePath } from "next/cache";
import { Role, UserRole } from "@prisma/client";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { getUserPermission } from "@/lib/helpers/server/PermissionsService";
import { createUserSession, setLoggedUser } from "@/lib/services/session.server";
import { redirect } from "next/navigation";
import TitleDataLayout from "@/context/TitleDataLayout";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("settings.members.title")} | ${getDefaultSiteTags.title}`,
  });
}

export type AppSettingsMembersLoaderData = {
  users: TenantUserWithUserDto[];
  pendingInvitations: TenantUserInvitationsModel[];
  roles: RoleWithPermissionsDto[];
  permissions: PermissionsModel[];
  groups: GroupWithDetailsDto[];
  appUrl: string;
};

const loader = async () => {
  const tenantSlug = await requireTenantSlug();
  const tenant = await getTenantIdFromUrl(tenantSlug);
  const tenantId = typeof tenant === "string" ? tenant : (tenant as any).id;
  await verifyUserHasPermission("app.settings.members.view", tenantId);
  const userInfo = await getUserInfo();

  const users = await db.tenantUser.getAll(tenantId);
  const rawPendingInvitations = await db.tenantUserInvitations.getPending(tenantId);
  const pendingInvitations = rawPendingInvitations.map((invitation: any) => ({
    ...invitation,
    acceptedAt: invitation.acceptedAt ?? null,
    expiresAt: invitation.expiresAt ?? null,
  }));

  const roles = await db.roles.getAllRoles("app");
  const permissions = await db.permissions.getAllPermissions("app");

  const { permission, userPermission } = await getUserPermission({
    userId: userInfo.userId!,
    permissionName: "app.settings.groups.full",
    tenantId: tenantId,
  });
  let groups: GroupWithDetailsDto[];
  if (!permission || userPermission) {
    groups = await db.groups.getAllGroups(tenantId);
  } else {
    groups = await db.groups.getMyGroups(userInfo.userId!, tenantId);
  }

  const data: AppSettingsMembersLoaderData = {
    users,
    pendingInvitations,
    roles,
    permissions,
    groups,
    appUrl: await getBaseURL(),
  };
  return data;
};
type ActionData = {
  success?: string;
  error?: string;
};
export const actionAppSettingsMembersLayout = async (prev: any, form: FormData) => {
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantSlug = await requireTenantSlug();
  const tenant = await getTenantIdFromUrl(tenantSlug);
  const tenantId = typeof tenant === "string" ? tenant : (tenant as any).id;
  const userInfo = await getUserInfo();
  const action = form.get("action")?.toString();
  const fromUser = await getUser(userInfo.userId!);
  if (!fromUser) {
    return { error: "Invalid user" };
  }

  if (action === "delete-invitation") {
    const invitationId = form.get("invitation-id")?.toString() ?? "";
    const invitation = await db.tenantUserInvitations.getUserInvitation(invitationId);
    if (!invitation) {
      return { error: "Invitation not found" };
    }
    await db.tenantUserInvitations.deleteUserInvitation(invitation.id);
    revalidatePath(`/app/${tenantSlug}/settings/members`);
    return { success: "Invitation deleted" };
  }
  if (action === "edit") {
    const userId = form.get("user-id")?.toString() ?? "";
    const roleId = form.get("role-id")?.toString() ?? "";
    const add = form.get("add") === "true";

    const role = await db.roles.getRole(roleId);

    if (role?.name === AppRoleEnum.SuperUser) {
      const allMembers = await db.tenantUser.getAll(tenantId);
      const superAdmins = allMembers.filter((m) =>
        m.user.roles.some((r: UserRole & { role: Role }) => r.tenantId === tenantId && r.role.name === AppRoleEnum.SuperUser)
      );
      if (superAdmins.length === 1 && !add) {
        return { error: "There must be at least one super user" };
      }
      if (userId === userInfo.userId) {
        return { error: "You cannot remove yourself from the super user role" };
      }
    }
    if (add) {
      await db.userRoles.createUserRole(userId, roleId, tenantId);
    } else {
      await db.userRoles.deleteUserRole(userId, roleId, tenantId);
    }
    revalidatePath(`/app/${tenantSlug}/settings/members`);
    return { success: t("shared.updated") };
  } else if (action === "impersonate") {
    // TODO: Add permission check for impersonation
    const userId = form.get("user-id")?.toString();
    const user = await getUser(userId);
    if (!user) {
      return { error: t("shared.notFound") };
    }
    if (user.admin) {
      return { error: "You cannot impersonate a super admin user" };
    }
    const userSession = await setLoggedUser(user);
    if (!userSession) {
      return { error: t("shared.notFound") };
    }
    const tenantData = await db.tenants.getTenant(userSession.defaultTenantId);
    const redirectUrl = tenantData ? `/app/${tenantData.slug ?? tenantData.id}/dashboard` : "/app";

    await createUserSession(
      {
        ...userInfo,
        ...userSession,
        impersonatingFromUserId: userInfo.userId!,
      },
      redirectUrl
    );
    redirect(redirectUrl);
  } else {
    return { error: t("shared.invalidForm") };
  }
};

export default async function ({ children }: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await loader();
  const title = `${t("settings.members.title")} | ${defaultSiteTags.title}`;

  return (
    <TitleDataLayout data={{ title }}>
      <Component data={data}>{children}</Component>
    </TitleDataLayout>
  );
}
