"use server";

import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export async function actionAdminCookiesSettings(prevState: any, formData: FormData) {
  try {
    await verifyUserHasPermission("admin.settings.cookies.update");
    const { t } = await getServerTranslations();
    const action = formData.get("action");
    
    if (action === "update") {
      await db.appConfiguration.getOrCreateAppConfiguration();
      await db.appConfiguration.updateAppConfiguration({
        cookiesEnabled: formData.get("enabled") === "true",
      });
      return { success: t("shared.updated") };
    } else {
      return { error: t("shared.invalidForm") };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "An error occurred" };
  }
}
