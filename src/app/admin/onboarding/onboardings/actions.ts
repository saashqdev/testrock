"use server";

import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

export async function createOnboarding(formData: FormData) {
  try {
    await verifyUserHasPermission("admin.onboarding.create");
    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();

    const title = formData.get("title")?.toString() ?? "";
    if (!title) {
      return { error: "Onboarding title is required" };
    }

    const onboarding = await db.onboarding.createOnboarding({
      title,
      type: "modal",
      active: false,
      realtime: false,
      canBeDismissed: true,
      height: "xl",
      filters: [{ type: "user.is", value: userInfo.userId }],
      steps: [],
    });

    redirect(`/admin/onboarding/onboardings/${onboarding.id}`);
  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error?.message || "An error occurred while creating the onboarding" };
  }
}
