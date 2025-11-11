"use server";

import { prisma } from "@/db/config/prisma/database";

export async function deleteAllAnalytics() {
  await prisma.analyticsUniqueVisitor.deleteMany({});
  await prisma.analyticsPageView.deleteMany({});
  await prisma.analyticsEvent.deleteMany({});
  return { deleteSuccess: true };
}

export async function updateSettings(formData: FormData) {
  let settings = await prisma.analyticsSettings.findFirst({});
  if (!settings) {
    settings = await prisma.analyticsSettings.create({ 
      data: { public: false, ignorePages: "/admin/analytics", onlyPages: "" } 
    });
  }

  const action = formData.get("action");
  
  if (action === "set-settings") {
    const isPublicStr = formData.get("public");
    const isPublic = isPublicStr === "true" || isPublicStr === "on";
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
