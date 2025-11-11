import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("settings.admin.cookies.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  await verifyUserHasPermission("admin.settings.cookies.view");
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  
  return <Component appConfiguration={appConfiguration} />;
}
