import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `Danger | ${getDefaultSiteTags.title}`,
  });
}

export default async function () {
  await verifyUserHasPermission("admin.kb.view");
  return <Component />;
}
