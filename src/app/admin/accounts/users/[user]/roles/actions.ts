"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { setUserRoles } from "@/utils/services/userService";
import { db } from "@/db";

export async function setUserRolesAction(userId: string, roleIds: string[]) {
  await verifyUserHasPermission("admin.users.view");
  const { t } = await getServerTranslations();

  const user = await db.users.getUser(userId);
  if (!user) {
    return { error: t("shared.notFound") };
  }

  const roles = await Promise.all(
    roleIds.map(async (id) => {
      const role = await db.roles.getRole(id);
      if (!role) return null;
      return { role, tenantId: null };
    })
  );

  const validRoles = roles.filter((r) => r !== null) as { role: any; tenantId: null }[];

  await setUserRoles({
    user,
    roles: validRoles,
    isAdmin: false,
    type: "admin",
  });

  return { success: t("shared.updated") };
}
