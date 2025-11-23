import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("settings.admin.internationalization.title")} | ${siteTags.title}`,
  };
}

export default async function () {
  await verifyUserHasPermission("admin.settings.internationalization.view");
  return <Component />;
}
