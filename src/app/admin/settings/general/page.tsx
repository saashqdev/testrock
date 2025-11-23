import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("settings.admin.general.title")} | ${getDefaultSiteTags.title}`,
  });
}

export default async function () {
  await verifyUserHasPermission("admin.settings.general.view");
  return <Component />;
}
