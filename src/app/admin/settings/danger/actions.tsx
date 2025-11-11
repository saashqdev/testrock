"use server";

import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";

export const actionAdminDangerSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "delete") {
    await verifyUserHasPermission("admin.settings.danger.reset");
    await db.appConfiguration.deleteAppConfiguration();
    revalidatePath("/admin/settings/danger");
    return { success: "Configuration reset successfully" };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
