"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/config/prisma/database";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function deleteAllAnalytics() {
  await verifyUserHasPermission("admin.analytics.view");
  await prisma.analyticsUniqueVisitor.deleteMany({});
  await prisma.analyticsPageView.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  return { deleteSuccess: true };
}

export async function updateSettings(formData: FormData) {
  await verifyUserHasPermission("admin.analytics.view");

  let settings = await prisma.analyticsSettings.findFirst({});
  if (!settings) {
    settings = await prisma.analyticsSettings.create({
      data: { public: false, ignorePages: "/admin/analytics", onlyPages: "" },
    });
  }

  const action = formData.get("action");

  if (action === "set-settings") {
    const isPublicStr = formData.get("public")?.toString() ?? "false";
    const isPublic = isPublicStr === "true";
    const ignorePage = formData.get("ignore-page")?.toString() ?? "";
    let ignorePages = settings.ignorePages.split(",");
    if (ignorePage !== "" && !ignorePages.includes(ignorePage)) {
      ignorePages = [...ignorePages, ignorePage];
    }
    await prisma.analyticsSettings.update({
      where: { id: settings.id },
      data: {
        public: isPublic,
        ignorePages: ignorePages.join(","),
      },
    });
    revalidatePath("/admin/analytics/settings");
    return { setSettingsSuccess: true };
  }

  if (action === "remove-ignored-page") {
    const ignoredPage = formData.get("ignored-page")?.toString() ?? "";
    let ignorePages = settings.ignorePages.split(",");
    if (ignorePages.includes(ignoredPage)) {
      ignorePages = ignorePages.filter((page) => page !== ignoredPage);
    }
    await prisma.analyticsSettings.update({
      where: { id: settings.id },
      data: {
        ignorePages: ignorePages.join(","),
      },
    });
    return { setSettingsSuccess: true };
  }

  return { error: "Invalid form" };
}
