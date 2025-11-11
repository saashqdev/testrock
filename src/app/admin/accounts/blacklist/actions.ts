"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function createBlacklistEntry(formData: FormData) {
  await verifyUserHasPermission("admin.blacklist.manage");
  const { t } = await getServerTranslations();

  const type = formData.get("type")?.toString();
  const value = formData.get("value")?.toString();

  if (!type || !value) {
    return { error: "Missing required fields" };
  }

  await db.blacklist.addToBlacklist({
    type,
    value,
  });

  return { success: t("shared.created") };
}

export async function deleteBlacklistEntry(type: string, value: string) {
  await verifyUserHasPermission("admin.blacklist.manage");
  const { t } = await getServerTranslations();

  await deleteBlacklistEntry(type, value);

  return { success: t("shared.deleted") };
}
