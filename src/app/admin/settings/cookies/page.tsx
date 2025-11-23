import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("settings.admin.cookies.title")} | ${siteTags.title}`,
  };
}

export default async function () {
  await verifyUserHasPermission("admin.settings.cookies.view");
  const appConfiguration = await db.appConfiguration.getAppConfiguration();

  return <Component appConfiguration={appConfiguration} />;
}
