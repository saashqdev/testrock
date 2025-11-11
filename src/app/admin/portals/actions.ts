"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function deletePortal(id: string) {
  await verifyUserHasPermission("admin.settings.general.view");
  const { t } = await getServerTranslations();

  try {
    await db.portals.deletePortal(id);
    return { success: t("shared.deleted") };
  } catch (e: any) {
    return { error: e.message || "Failed to delete portal" };
  }
}
