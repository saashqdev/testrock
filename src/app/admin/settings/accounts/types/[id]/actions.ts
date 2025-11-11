"use server";

import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { redirect } from "next/navigation";

async function checkPermission(permissionName: string) {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw new Error("Unauthorized");
  }
  const permission = await db.permissions.getPermissionName(permissionName);
  if (permission) {
    const userPermission = (await db.userRoles.countUserPermission(userInfo.userId, null, permissionName)) > 0;
    if (!userPermission) {
      throw new Error(`Permission denied: ${permissionName}`);
    }
  }
  return true;
}

export async function updateTenantTypeAction(id: string, formData: FormData) {
  try {
    await checkPermission("admin.accountTypes.update");
    const { t } = await getServerTranslations();

    const item = await db.tenantTypes.getTenantType(id);
    if (!item) {
      redirect("/admin/settings/accounts/types");
    }

    const title = formData.get("title")?.toString().trim();
    const titlePlural = formData.get("titlePlural")?.toString().trim();
    const description = formData.get("description")?.toString() || null;
    const isDefault = Boolean(formData.get("isDefault"));
    const subscriptionProducts = formData.getAll("subscriptionProducts[]").map((f) => f.toString());

    if (!title || !titlePlural) {
      return { error: t("shared.invalidForm") };
    }

    const existing = await db.tenantTypes.getTenantTypeByTitle(title);
    if (existing && existing.id !== item.id) {
      return { error: t("shared.alreadyExists") };
    }

    await db.tenantTypes.updateTenantType(id, {
      title,
      titlePlural,
      description,
      isDefault,
      subscriptionProducts,
    });

    return { success: t("shared.updated") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}

export async function deleteTenantTypeAction(id: string) {
  try {
    await checkPermission("admin.accountTypes.delete");
    const { t } = await getServerTranslations();

    const item = await db.tenantTypes.getTenantType(id);
    if (!item) {
      redirect("/admin/settings/accounts/types");
    }

    await db.tenantTypes.deleteTenantType(id);

    return { success: t("shared.deleted") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
