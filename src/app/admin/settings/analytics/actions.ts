"use server";

import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { revalidatePath } from "next/cache";
import { db } from "@/db";

export const actionAnalyticsSettings = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "update") {
    await verifyUserHasPermission("admin.settings.analytics.update");
    await db.appConfiguration.updateAppConfiguration({
      analyticsSimpleAnalytics: Boolean(form.get("simpleAnalytics")),
      analyticsPlausibleAnalytics: Boolean(form.get("plausibleAnalytics")),
      analyticsGoogleAnalyticsTrackingId: form.get("googleAnalyticsTrackingId")?.toString(),
    });
    revalidatePath("/admin/settings/analytics");
    return { success: t("shared.updated") };
  } else {
    return { error: t("shared.invalidForm") };
  }
};
