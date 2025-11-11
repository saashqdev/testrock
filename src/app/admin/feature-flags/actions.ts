"use server";

import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { revalidatePath } from "next/cache";

export async function toggleFeatureFlag(id: string, enabled: boolean) {
  const { t } = await getServerTranslations();

  const flag = await db.featureFlags.getFeatureFlag({ id });
  if (!flag) {
    throw new Error(t("shared.notFound"));
  }

  await db.featureFlags.updateFeatureFlag({ id }, {
    enabled,
  });

  revalidatePath("/admin/feature-flags");
  
  return { success: true };
}
