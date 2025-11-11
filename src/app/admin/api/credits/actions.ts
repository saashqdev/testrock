"use server";

import { db } from "@/db";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteCreditsAction(ids: string[]) {
  const headersList = await headers();
  const request = new Request(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000', {
    headers: headersList as any,
  });

  await verifyUserHasPermission("admin.apiKeys.delete");
  
  try {
    await db.credits.deleteCredits(ids);
    revalidatePath('/admin/api/credits');
    return { success: true };
  } catch (error) {
    const { t } = await getServerTranslations();
    return { error: t("shared.invalidForm"), success: false };
  }
}
