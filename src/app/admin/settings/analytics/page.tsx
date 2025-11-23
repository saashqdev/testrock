import { getServerTranslations } from "@/i18n/server";
import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("settings.admin.analytics.title")} | ${siteTags.title}`,
  };
}

export default async function () {
  await verifyUserHasPermission("admin.settings.analytics.view");
  return <Component />;
}
